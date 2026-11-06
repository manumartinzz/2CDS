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
