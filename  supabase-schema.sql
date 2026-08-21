-- AcquaSafe / Supabase
-- Execute este arquivo no SQL Editor do Supabase antes de publicar o site.
-- A chave anon/public pode ficar no navegador. NUNCA coloque a service_role key no HTML.

create extension if not exists pgcrypto;

-- Catálogo usado pelo fluxo de pagamento.
create table if not exists public.plans (
    id text primary key,
    name text not null,
    price numeric(10, 2) not null check (price >= 0),
    active boolean not null default true,
    created_at timestamptz not null default now()
);

insert into public.plans (id, name, price)
values
    ('basic', 'Plano Básico', 49.00),
    ('pro', 'Plano Profissional', 89.00),
    ('enterprise', 'Plano Empresarial', 199.00)
on conflict (id) do update set name = excluded.name, price = excluded.price;

-- Perfil público do usuário. A senha fica somente no Supabase Auth;
-- ela não é armazenada nesta tabela.
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    email text,
    identifier text not null,
    identifier_key text not null unique,
    phone text,
    role text not null default 'client' check (role in ('client', 'admin')),
    status text not null default 'active' check (status in ('active', 'blocked')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_created_at_idx on public.profiles(created_at desc);

create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    plan_id text not null references public.plans(id),
    plan_name text not null,
    price numeric(10, 2) not null check (price >= 0),
    status text not null default 'active' check (status in ('active', 'canceled', 'expired')),
    started_at timestamptz not null default now(),
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions(user_id, created_at desc);
create index if not exists subscriptions_expiration_idx on public.subscriptions(expires_at);

-- O código é visível apenas ao próprio usuário e aos administradores.
create table if not exists public.access_codes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    subscription_id uuid not null references public.subscriptions(id) on delete cascade,
    code text not null,
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    unique (user_id, code)
);

create index if not exists access_codes_user_idx on public.access_codes(user_id, created_at desc);

-- Conteúdo gerenciado no painel administrativo.
create table if not exists public.diseases (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    category text,
    description text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into public.diseases (name, category, description)
values
    ('Diabetes tipo 1', 'Metabólica', 'Doença autoimune que afeta a produção de insulina.'),
    ('Diabetes tipo 2', 'Metabólica', 'Resistência à insulina associada a hábitos de vida.'),
    ('Hipertensão arterial', 'Cardiovascular', 'Pressão arterial cronicamente elevada.'),
    ('Insuficiência renal', 'Renal', 'Redução da função dos rins.'),
    ('Dermatite atópica', 'Dermatológica', 'Inflamação crônica da pele.'),
    ('Asma', 'Respiratória', 'Obstrução reversível das vias aéreas.')
on conflict (name) do nothing;

-- Atualiza updated_at sem deixar o navegador controlar a data.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists diseases_set_updated_at on public.diseases;
create trigger diseases_set_updated_at
before update on public.diseases
for each row execute function public.set_updated_at();

-- Cria automaticamente um perfil quando alguém se cadastra pelo Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (
        id, full_name, email, identifier, identifier_key
    ) values (
        new.id,
        coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Usuário AcquaSafe'),
        new.email,
        coalesce(nullif(new.raw_user_meta_data->>'identifier', ''), new.email),
        coalesce(nullif(new.raw_user_meta_data->>'identifier_key', ''), lower(new.email))
    )
    on conflict (id) do update set
        full_name = excluded.full_name,
        email = excluded.email,
        identifier = excluded.identifier,
        identifier_key = excluded.identifier_key;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Função usada pelo front-end para decidir se o usuário atual é admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
          and status = 'active'
    );
$$;

-- Ativação transacional do plano. O preço é sempre lido do catálogo do banco,
-- e nunca aceito do navegador.
create or replace function public.activate_plan(p_plan_id text, p_code text)
returns table (
    codigo_acesso text,
    validade timestamptz,
    plano_id text,
    plano_nome text,
    preco numeric
)
language plpgsql
security definer set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_plan public.plans%rowtype;
    v_subscription public.subscriptions%rowtype;
    v_code text := upper(trim(p_code));
begin
    if v_user_id is null then
        raise exception 'not_authenticated';
    end if;

    if exists (
        select 1 from public.profiles
        where id = v_user_id and status = 'blocked'
    ) then
        raise exception 'account_blocked';
    end if;

    if v_code is null or length(v_code) < 8 then
        raise exception 'invalid_access_code';
    end if;

    select * into v_plan
    from public.plans
    where id = p_plan_id and active = true;

    if not found then
        raise exception 'plan_not_found';
    end if;

    -- Um novo pagamento encerra planos anteriores do mesmo cliente.
    update public.subscriptions
       set status = 'expired'
     where user_id = v_user_id and status = 'active';

    insert into public.subscriptions (
        user_id, plan_id, plan_name, price, status, expires_at
    ) values (
        v_user_id, v_plan.id, v_plan.name, v_plan.price,
        'active', now() + interval '30 days'
    ) returning * into v_subscription;

    insert into public.access_codes (
        user_id, subscription_id, code, expires_at
    ) values (
        v_user_id, v_subscription.id, v_code, v_subscription.expires_at
    );

    return query select
        v_code,
        v_subscription.expires_at,
        v_plan.id,
        v_plan.name,
        v_plan.price;
end;
$$;

-- ============================== RLS ==========================================
-- O site usa a chave anon, portanto estas políticas são obrigatórias.
alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.access_codes enable row level security;
alter table public.diseases enable row level security;

drop policy if exists "plans_public_read" on public.plans;
create policy "plans_public_read" on public.plans
for select using (active = true);

drop policy if exists "profiles_read_own_or_admin" on public.profiles;
create policy "profiles_read_own_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subscriptions_read_own_or_admin" on public.subscriptions;
create policy "subscriptions_read_own_or_admin" on public.subscriptions
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "access_codes_read_own_or_admin" on public.access_codes;
create policy "access_codes_read_own_or_admin" on public.access_codes
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "diseases_public_read" on public.diseases;
create policy "diseases_public_read" on public.diseases
for select using (active = true or public.is_admin());

drop policy if exists "diseases_admin_insert" on public.diseases;
create policy "diseases_admin_insert" on public.diseases
for insert with check (public.is_admin());

drop policy if exists "diseases_admin_update" on public.diseases;
create policy "diseases_admin_update" on public.diseases
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "diseases_admin_delete" on public.diseases;
create policy "diseases_admin_delete" on public.diseases
for delete using (public.is_admin());

-- Depois de criar cada usuário administrador no Authentication > Users,
-- marque-o como admin executando (troque o e-mail):
-- update public.profiles set role = 'admin' where email = 'admin@exemplo.com';

-- Verificação rápida:
-- select table_name from information_schema.tables
-- where table_schema = 'public' and table_name in
-- ('profiles', 'plans', 'subscriptions', 'access_codes', 'diseases');