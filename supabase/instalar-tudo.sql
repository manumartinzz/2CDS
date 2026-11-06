-- ============================================================================
--  AcquaSafe · INSTALAÇÃO COMPLETA EM UM ÚNICO PASSO
--  ============================================================================
--  COLE ESTE ARQUIVO INTEIRO no SQL Editor e clique em RUN uma única vez.
--  Ele já contém, na ordem correta:
--      PARTE 1 → schema.sql   (tabelas, colunas, funções, RPCs, RLS, seeds)
--      PARTE 2 → admins.sql   (marca as 4 contas administradoras)
--      PARTE 3 → verificação  (mostra em português se deu tudo certo)
--
--  É IDEMPOTENTE: rodar de novo não duplica nada nem apaga cadastros.
--  É SEGURO para banco que JÁ TEM DADOS: limpa assinaturas ativas
--  duplicadas antes de criar o índice único.
--
--  Depois de rodar, a tabela "RESULTADO" no fim deve mostrar tudo OK.
--  NÃO execute  select * from public.admin_listar_clientes();  por aqui:
--  essa RPC usa auth.uid() e no SQL Editor não há usuário logado. Teste
--  pelo SITE, entrando com uma das 4 contas admin.
-- ============================================================================


-- ############################################################################
--  PARTE 1 de 3 · SCHEMA COMPLETO
-- ############################################################################
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
  tipo_lavoura    text not null default 'soja',
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
alter table public.profiles add column if not exists tipo_lavoura text not null default 'soja';
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists bloqueado boolean not null default false;
alter table public.profiles add column if not exists motivo_bloqueio text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- Bancos antigos nao guardavam e-mail no perfil. admins.sql e a RPC de
-- clientes precisam dele, entao preenchemos a partir do Supabase Auth.
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or lower(p.email) <> lower(coalesce(u.email, '')));

-- Cria o perfil automaticamente no cadastro (signUp em cadastro.js).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome_completo, cpf, tipo_lavoura)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', ''),
    new.raw_user_meta_data ->> 'cpf',
    coalesce(nullif(new.raw_user_meta_data ->> 'tipo_lavoura', ''), 'soja')
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
  id           uuid primary key default gen_random_uuid(),
  nome         text not null unique,
  preco        numeric(10,2) not null,
  preco_mensal numeric(10,2),
  descricao    text,
  mais_popular boolean default false,
  ativo        boolean default true,
  created_at   timestamptz not null default now()
);

-- Banco antigo usa preco_mensal e NAO tem UNIQUE(nome): alinha as colunas
-- sem apagar nada. perfil.js le preco; pagamento.js usa so id/nome.
alter table public.planos add column if not exists preco        numeric(10,2);
alter table public.planos add column if not exists preco_mensal numeric(10,2);
alter table public.planos add column if not exists descricao    text;
alter table public.planos add column if not exists mais_popular boolean default false;
alter table public.planos add column if not exists ativo        boolean default true;
update public.planos set preco        = coalesce(preco, preco_mensal) where preco is null;
update public.planos set preco_mensal = coalesce(preco_mensal, preco) where preco_mensal is null;

insert into public.planos (nome, preco, preco_mensal)
select v.nome, v.preco, v.preco
from (values
  ('Plano Básico',       49.00),
  ('Plano Profissional', 89.00),
  ('Plano Empresarial', 199.00)
) as v(nome, preco)
where not exists (select 1 from public.planos p where p.nome = v.nome);

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

-- Bancos antigos podem ter MAIS DE UMA assinatura "ativa" por usuário
-- (o pagamento.js antigo fazia INSERT sem upsert). Sem esta limpeza, o
-- índice único abaixo falharia e abortaria todo o resto do script.
-- Mantém a mais recente e cancela as demais.
update public.assinaturas
set status = 'cancelada'
where id in (
  select id from (
    select id,
           row_number() over (
             partition by user_id order by created_at desc, id desc
           ) as pos
    from public.assinaturas
    where status = 'ativa'
  ) duplicadas
  where duplicadas.pos > 1
);

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

-- Banco antigo chama a coluna de criado_em; perfil.js le created_at.
alter table public.pagamentos add column if not exists created_at timestamptz not null default now();
alter table public.pagamentos add column if not exists criado_em timestamptz;
update public.pagamentos set created_at = criado_em
where criado_em is not null and created_at <> criado_em;

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
    u.email::text,
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
  left join auth.users u on u.id = p.id
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
--
--     A assinatura (3 colunas, nesta ordem) é mantida igual à do banco já
--     existente: CREATE OR REPLACE não consegue trocar o tipo de retorno.
create or replace function public.obter_codigo_acesso(identificador text)
returns table (
  codigo_acesso    text,
  codigo_expira_em timestamptz,
  email            text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_digitos text := regexp_replace(coalesce(identificador, ''), '\D', '', 'g');
begin
  return query
  select a.codigo_acesso, a.codigo_expira_em, u.email::text
  from auth.users u
  join public.profiles p on p.id = u.id
  join lateral (
    select s.codigo_acesso, s.codigo_expira_em
    from public.assinaturas s
    where s.user_id = u.id and s.status = 'ativa'
    order by s.created_at desc
    limit 1
  ) a on true
  where lower(coalesce(u.email, '')) = lower(btrim(coalesce(identificador, '')))
     or (
       length(v_digitos) = 11
       and regexp_replace(coalesce(p.cpf, ''), '\D', '', 'g') = v_digitos
     )
  limit 1;
end;
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
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'leituras'
     ) then
    begin
      execute 'alter publication supabase_realtime add table public.leituras';
    exception when others then
      raise notice 'Realtime nao configurado automaticamente: %', sqlerrm;
    end;
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


-- ############################################################################
--  PARTE 2 de 3 · CONTAS ADMINISTRADORAS
-- ############################################################################
-- ============================================================================
--  AcquaSafe · Contas administradoras
--  ============================================================================
--  Execute UMA VEZ no SQL Editor do Supabase, DEPOIS de schema.sql.
--  Atalho: supabase/instalar-tudo.sql já contém os dois arquivos na ordem
--  certa — basta colar aquele único arquivo e dar Run.
--  Marca as 4 contas administradoras como is_admin = true no banco.
--
--  Por que isso é necessário: a lista em config-admins.js controla apenas a
--  INTERFACE (login sem código, botão do painel admin, ícone com coroa).
--  A RPC admin_listar_clientes() e as policies de RLS conferem
--  profiles.is_admin no SERVIDOR. Sem este SQL, os painéis admin abrem mas
--  a lista de clientes retorna "Acesso negado".
--
--  OBS.: o pedido citava "três contas", mas foram informados 4 e-mails.
-- ============================================================================

update public.profiles
set is_admin = true,
    bloqueado = false,
    motivo_bloqueio = null
where lower(coalesce(email, '')) in (
  'milenakachimarck@gmail.com',
  'maria.luiza.girelli@gmail.com',
  'mayra.calegario@gmail.com',
  'emanuelle.martins@gmail.com'
);

-- Se alguma conta ainda não tiver linha em profiles (cadastro antigo), cria.
insert into public.profiles (id, email, nome_completo, is_admin)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'nome_completo', ''), true
from auth.users u
where lower(coalesce(u.email, '')) in (
  'milenakachimarck@gmail.com',
  'maria.luiza.girelli@gmail.com',
  'mayra.calegario@gmail.com',
  'emanuelle.martins@gmail.com'
)
on conflict (id) do update set is_admin = true;

-- Conferência:
-- select email, is_admin, bloqueado from public.profiles
--  where lower(email) like '%@gmail.com' order by email;
-- ============================================================================

-- ############################################################################
--  PARTE 3 de 3 · RESULTADO (leia esta tabela)
-- ############################################################################

select 'Tabelas'::text as item,
       ((select count(*) from information_schema.tables
          where table_schema = 'public'
            and table_name in ('profiles','planos','assinaturas','pagamentos',
                               'leituras','doencas','solucoes'))::text || ' de 7') as resultado
union all
select 'Coluna tipo_lavoura',
       case when exists (select 1 from information_schema.columns
                          where table_schema='public' and table_name='profiles'
                            and column_name='tipo_lavoura')
            then 'OK' else 'FALTA — rode a PARTE 1' end
union all
select 'Funcao is_admin()',
       case when exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                          where n.nspname='public' and p.proname='is_admin')
            then 'OK' else 'FALTA — rode a PARTE 1' end
union all
select 'RPC admin_listar_clientes()',
       case when exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                          where n.nspname='public' and p.proname='admin_listar_clientes')
            then 'OK' else 'FALTA — rode a PARTE 1' end
union all
select 'Admins com is_admin=true',
       ((select count(*) from public.profiles where is_admin)::text || ' (minimo 4)');

-- Lista TODOS os admins: se aparecer alguem alem das 4 contas, e uma conta
-- administradora que ja existia no banco (nao foi criada por este script).
select coalesce(p.email, '(sem e-mail)') as admin, p.is_admin, p.bloqueado
from public.profiles p where p.is_admin order by 1;

-- Detalhe das 4 contas (todas devem estar com is_admin = true):
select coalesce(email, '(sem e-mail)') as email, is_admin, bloqueado
from public.profiles
where lower(coalesce(email, '')) in (
  'milenakachimarck@gmail.com',
  'maria.luiza.girelli@gmail.com',
  'mayra.calegario@gmail.com',
  'emanuelle.martins@gmail.com'
)
order by email;

-- ============================================================================
--  FIM. Se alguma linha mostrar FALTA, copie a mensagem de erro vermelha
--  que apareceu acima e me envie.
-- ============================================================================
