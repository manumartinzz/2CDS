-- ============================================================================
--  AcquaSafe · Schema completo do banco (Supabase / PostgreSQL)
--  ============================================================================
--  Execute UMA VEZ no SQL Editor do Supabase (https://app.supabase.com →
--  seu projeto → SQL Editor → New query → Run).
--
--  O script é IDEMPOTENTE: pode ser reexecutado sem duplicar tabelas,
--  policies, funções ou dados de catálogo.
--
--  ANTES: o repositório só versionava supabase/leituras.sql (apenas a
--  tabela de leituras de demonstração). Todo o resto — perfis, planos,
--  assinaturas, pagamentos, catálogos e RPCs — existia só no banco e não
--  podia ser recriado. Este arquivo corrige isso.
--
--  Modelo canônico de leituras: public.leituras
--  (portal.js, sensor.js e bridge/ph_serial_bridge.py usam a MESMA tabela).
--  As tabelas antigas "sensores" / "leituras_sensores" / "alertas" NÃO são
--  mais usadas pelo frontend após a unificação do painel.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Perfis (1 linha por usuário do Supabase Auth)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  nome_completo   text,
  cpf             text,
  telefone        text,
  is_admin        boolean not null default false,
  bloqueado       boolean not null default false,
  motivo_bloqueio text,
  created_at      timestamptz not null default now()
);

-- Bancos já existentes podem não ter as colunas de bloqueio.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists nome_completo text;
alter table public.profiles add column if not exists cpf text;
alter table public.profiles add column if not exists telefone text;
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists bloqueado boolean not null default false;
alter table public.profiles add column if not exists motivo_bloqueio text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- Cria o perfil automaticamente no cadastro (signUp em cadastro.js).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome_completo)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Preenche perfis que ficaram órfãos em bancos antigos.
insert into public.profiles (id, email, nome_completo)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'nome_completo', '')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Planos / assinaturas / pagamentos
-- ---------------------------------------------------------------------------
create table if not exists public.planos (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  preco      numeric(10,2) not null,
  created_at timestamptz not null default now()
);

insert into public.planos (nome, preco) values
  ('Plano Básico',       49.00),
  ('Plano Profissional', 89.00),
  ('Plano Empresarial', 199.00)
on conflict (nome) do nothing;

create table if not exists public.assinaturas (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  plano_id          uuid references public.planos(id),
  status            text not null default 'pendente'
                    check (status in ('pendente','ativa','cancelada','expirada')),
  codigo_acesso     text,
  codigo_gerado_em  timestamptz,
  codigo_expira_em  timestamptz,
  data_inicio       timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists assinaturas_user_idx
  on public.assinaturas (user_id, created_at desc);

-- Garante no SERVIDOR que não existam duas assinaturas ativas por usuário
-- (o frontend sozinho não é confiável para isso).
create unique index if not exists assinaturas_uma_ativa_por_usuario
  on public.assinaturas (user_id)
  where status = 'ativa';

create table if not exists public.pagamentos (
  id             uuid primary key default gen_random_uuid(),
  assinatura_id  uuid references public.assinaturas(id) on delete cascade,
  forma          text,
  valor          numeric(10,2),
  status         text not null default 'aprovado',
  confirmado_em  timestamptz,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Leituras (modelo ÚNICO, usado pelo portal e pelo sensor de pH)
-- ---------------------------------------------------------------------------
create table if not exists public.leituras (
  id           bigint generated always as identity primary key,
  sensor_id    text not null default 'sensor-01',
  ph           numeric(5,2),
  fluor        numeric(6,2),
  cloro        numeric(6,2),
  turbidez     numeric(6,2),
  equipamento  text,       -- identificação opcional do equipamento
  localizacao  text,       -- identificação opcional do local
  usuario      text,       -- identificação opcional da conta
  criado_em    timestamptz not null default now()
);

alter table public.leituras add column if not exists equipamento text;
alter table public.leituras add column if not exists localizacao text;
alter table public.leituras add column if not exists usuario text;

create index if not exists leituras_sensor_criado_idx
  on public.leituras (sensor_id, criado_em desc);

-- ---------------------------------------------------------------------------
-- 4. Catálogos
-- ---------------------------------------------------------------------------
create table if not exists public.doencas (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  tipo              text,
  grupo_risco       text,
  doenca_associada  text,
  orgao_afetado     text,
  nivel_bsl         text,
  created_at        timestamptz not null default now()
);

create table if not exists public.solucoes (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  concentracao   text,
  solvente       text,
  uso            text,
  uso_principal  text,
  validade       integer,
  validade_dias  integer,
  observacoes    text
);

insert into public.solucoes (nome, concentracao, solvente, uso, uso_principal, validade_dias)
select v.nome, v.concentracao, v.solvente, v.uso, v.uso, v.validade_dias
from (values
  ('Hipoclorito de Sódio',      '10–15%',          'Água',            'Desinfecção',                     180),
  ('Sulfato de Cobre',          '0,1%',            'Água',            'Algicida',                        365),
  ('Ácido Peracético',          '5%',              'Água',            'Esterilização',                    90),
  ('Cloreto de Cálcio',         '2%',              'Água',            'Tratamento',                      240),
  ('Dióxido de Cloro',          '0,2–1,0 mg/L',    'Água',            'Desinfecção de água',              30),
  ('Peróxido de Hidrogênio',    '3–10%',           'Água',            'Oxidação e desinfecção',          180),
  ('Carvão Ativado Granular',   'Leito filtrante', 'Água',            'Remoção de odor e compostos',     365),
  ('Solução tampão pH 7,00',    'Pronta para uso', 'Água deionizada', 'Calibração de medidores de pH',   180),
  ('Solução padrão de turbidez','20 NTU',          'Suspensão padrão','Calibração de turbidímetro',      180)
) as v(nome, concentracao, solvente, uso, validade_dias)
where not exists (select 1 from public.solucoes s where s.nome = v.nome);

insert into public.doencas (nome, tipo, grupo_risco, doenca_associada, orgao_afetado, nivel_bsl)
select v.nome, v.tipo, v.grupo_risco, v.doenca_associada, v.orgao_afetado, v.nivel_bsl
from (values
  ('Phakopsora pachyrhizi',  'Fungo',   '2', 'Ferrugem asiática da soja', 'Folhas / vagens', 'BSL-2'),
  ('Phakopsora meibomiae',   'Fungo',   '2', 'Ferrugem americana da soja','Folhas',          'BSL-2'),
  ('Sclerotinia sclerotiorum','Fungo',  '2', 'Mofo-branco',                'Hastes / vagens', 'BSL-2'),
  ('Escherichia coli',        'Bactéria','2', 'Contaminação hídrica',      'Trato digestivo', 'BSL-2'),
  ('Heterodera glycines',     'Nematoide','2','Cisto da soja',              'Raízes',          'BSL-2')
) as v(nome, tipo, grupo_risco, doenca_associada, orgao_afetado, nivel_bsl)
where not exists (select 1 from public.doencas d where d.nome = v.nome);

-- ---------------------------------------------------------------------------
-- 5. Helper de administrador (SECURITY DEFINER evita recursão de RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. RPCs usadas pelo frontend
-- ---------------------------------------------------------------------------

-- 6.1 Lista de clientes para os painéis admin. Só administradores podem
--     chamar (sem isso a função vazaria e-mails de todos os clientes).
create or replace function public.admin_listar_clientes()
returns table (
  id             uuid,
  nome           text,
  cpf            text,
  email          text,
  telefone       text,
  plano          text,
  status         text,
  bloqueado      boolean,
  motivo_bloqueio text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado: requer perfil de administrador';
  end if;

  return query
  select
    p.id,
    coalesce(p.nome_completo, '—')::text,
    p.cpf,
    p.email,
    p.telefone,
    coalesce(pl.nome, 'Sem plano')::text,
    case
      when p.bloqueado then 'bloqueado'
      when a.status = 'ativa' then 'ativo'
      else 'pendente'
    end::text,
    p.bloqueado,
    p.motivo_bloqueio
  from public.profiles p
  left join lateral (
    select s.plano_id, s.status
    from public.assinaturas s
    where s.user_id = p.id and s.status = 'ativa'
    order by s.created_at desc
    limit 1
  ) a on true
  left join public.planos pl on pl.id = a.plano_id
  order by p.created_at desc;
end;
$$;

-- Funções novas no Postgres já vêm com EXECUTE para PUBLIC; revogamos
-- explicitamente antes de conceder só a perfis autenticados.
revoke all on function public.admin_listar_clientes() from public, anon;
grant execute on function public.admin_listar_clientes() to authenticated;

-- 6.2 Resolve e-mail/CPF → código de primeiro acesso.
--     Usada em login.js (login por CPF) e pagamento.js (reenviar código).
--     ATENÇÃO (limitação de demonstração): como a tela de reenvio é pública,
--     esta RPC é executável por anon e devolve o código de acesso. Em produção,
--     mova o reenvio para uma Edge Function autenticada/rate-limited e
--     revogue o execute de anon.
create or replace function public.obter_codigo_acesso(identificador text)
returns table (
  email             text,
  codigo_acesso     text,
  codigo_expira_em  timestamptz,
  nome_completo     text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.email,
    a.codigo_acesso,
    a.codigo_expira_em,
    p.nome_completo
  from public.profiles p
  left join lateral (
    select s.codigo_acesso, s.codigo_expira_em
    from public.assinaturas s
    where s.user_id = p.id and s.status = 'ativa'
    order by s.created_at desc
    limit 1
  ) a on true
  where lower(coalesce(p.email, '')) = lower(btrim(identificador))
     or (
       length(regexp_replace(coalesce(identificador, ''), '\D', '', 'g')) = 11
       and regexp_replace(coalesce(p.cpf, ''), '\D', '', 'g')
           = regexp_replace(identificador, '\D', '', 'g')
     )
  limit 1;
$$;

revoke all on function public.obter_codigo_acesso(text) from public;
grant execute on function public.obter_codigo_acesso(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. RLS (Row Level Security)
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.planos      enable row level security;
alter table public.assinaturas enable row level security;
alter table public.pagamentos  enable row level security;
alter table public.leituras    enable row level security;
alter table public.doencas     enable row level security;
alter table public.solucoes    enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- admin-bloqueios.js / admin-clientes.js atualizam linhas de OUTROS usuários
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- planos --------------------------------------------------------------------
drop policy if exists "planos_select" on public.planos;
create policy "planos_select" on public.planos for select to anon, authenticated
  using (true);

-- assinaturas ---------------------------------------------------------------
drop policy if exists "assinaturas_select" on public.assinaturas;
create policy "assinaturas_select" on public.assinaturas for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "assinaturas_insert" on public.assinaturas;
create policy "assinaturas_insert" on public.assinaturas for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "assinaturas_update" on public.assinaturas;
create policy "assinaturas_update" on public.assinaturas for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- pagamentos ----------------------------------------------------------------
drop policy if exists "pagamentos_select" on public.pagamentos;
create policy "pagamentos_select" on public.pagamentos for select to authenticated
  using (exists (
    select 1 from public.assinaturas a
    where a.id = pagamentos.assinatura_id and a.user_id = auth.uid()
  ));

drop policy if exists "pagamentos_insert" on public.pagamentos;
create policy "pagamentos_insert" on public.pagamentos for insert to authenticated
  with check (exists (
    select 1 from public.assinaturas a
    where a.id = pagamentos.assinatura_id and a.user_id = auth.uid()
  ));

-- leituras ------------------------------------------------------------------
-- SELECT/INSERT aberto: sensor.html e bridge/ph_serial_bridge.py gravam sem
-- login, usando apenas a anon key. Para produção, troque por um token de
-- dispositivo + RPC SECURITY DEFINER (comentários em supabase/leituras.sql).
drop policy if exists "leituras_select" on public.leituras;
create policy "leituras_select" on public.leituras for select to anon, authenticated
  using (true);

drop policy if exists "leituras_insert" on public.leituras;
create policy "leituras_insert" on public.leituras for insert to anon, authenticated
  with check (true);

-- catálogos -----------------------------------------------------------------
drop policy if exists "doencas_select" on public.doencas;
create policy "doencas_select" on public.doencas for select to anon, authenticated
  using (true);

drop policy if exists "doencas_write" on public.doencas;
create policy "doencas_write" on public.doencas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "solucoes_select" on public.solucoes;
create policy "solucoes_select" on public.solucoes for select to anon, authenticated
  using (true);

drop policy if exists "solucoes_write" on public.solucoes;
create policy "solucoes_write" on public.solucoes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 8. Realtime (portal.html?real=1 escuta INSERTs em leituras)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'leituras'
  ) then
    alter publication supabase_realtime add table public.leituras;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. Verificação rápida (rode separadamente)
-- ---------------------------------------------------------------------------
-- select table_name from information_schema.tables
--  where table_schema = 'public' order by table_name;
-- select id, sensor_id, ph, criado_em from public.leituras
--  order by criado_em desc limit 10;
-- select * from public.admin_listar_clientes();  -- só como admin logado
-- ============================================================================
