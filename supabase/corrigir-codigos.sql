-- ============================================================================
--  AcquaSafe · Reparo de códigos de acesso de assinaturas antigas
--  ============================================================================
--  Use quando o login diz "código inválido ou expirado" mesmo com o código
--  correto. Causa típica: assinaturas criadas antes de supabase/schema.sql
--  ficaram sem codigo_expira_em (NULL) ou sem codigo_acesso.
--
--  Rode no SQL Editor do Supabase. O script é idempotente: reexecutar não
--  altera linhas que já estão corretas.
-- ============================================================================

-- 1) DIAGNÓSTICO — rode primeiro e olhe as 3 últimas colunas -----------------
select
  u.email,
  a.status,
  a.codigo_acesso,
  a.codigo_gerado_em,
  a.codigo_expira_em,
  (a.codigo_expira_em is null)  as validade_nula,
  (a.codigo_expira_em < now())  as vencido,
  (a.codigo_acesso is null)     as sem_codigo
from public.assinaturas a
join auth.users u on u.id = a.user_id
order by a.created_at desc
limit 20;

-- 2) Preenche a validade em falta (ou vencida) -------------------------------
--    Assinaturas com código, mas sem data de expiração, eram consideradas
--    "expiradas" para sempre pelo login.js.
update public.assinaturas
set codigo_expira_em = now() + interval '30 days',
    codigo_gerado_em = coalesce(codigo_gerado_em, now()),
    status           = 'ativa'
where status = 'ativa'
  and codigo_acesso is not null
  and (codigo_expira_em is null or codigo_expira_em < now());

-- 3) Gera um código para assinaturas que não têm nenhum ----------------------
--    ATENÇÃO: isso CRIA UM CÓDIGO NOVO. Depois de rodar, peça um novo
--    reenvio pelo site — o código que chegou antes não serve mais.
update public.assinaturas
set codigo_acesso =
      'AQ' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 2)) ||
      '-'  || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)),
    codigo_gerado_em = coalesce(codigo_gerado_em, now()),
    codigo_expira_em = now() + interval '30 days',
    status = 'ativa'
where status = 'ativa'
  and codigo_acesso is null;

-- 4) Conferência final -------------------------------------------------------
select count(*) as total,
       count(*) filter (where codigo_acesso is null)     as sem_codigo,
       count(*) filter (where codigo_expira_em is null)  as validade_nula,
       count(*) filter (where codigo_expira_em < now())  as vencidos
from public.assinaturas
where status = 'ativa';

-- ============================================================================
--  Se o login continuar falhando, confirme também:
--   * o e-mail usado no "Reenviar Código" é o MESMO usado no login;
--   * o código foi copiado COM o hífen (formato AQ4G-58JX);
--   * o template do EmailJS usa {{access_code}} (ou {{passcode}}) e
--     "Para enviar um e-mail" está {{to_email}}.
-- ============================================================================
