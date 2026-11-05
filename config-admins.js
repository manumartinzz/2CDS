/*
  config-admins.js — AcquaSafe
  Lista única das contas administradoras do sistema.

  Essas contas:
   - NÃO precisam digitar o código de primeiro acesso no login;
   - NÃO precisam de assinatura ativa para entrar no painel;
   - são as únicas que veem o botão "Acessar Painel Admin";
   - recebem o ícone de perfil com coroa (fundo preto).

  OBS.: o usuário escreveu "três contas" mas listou QUATRO e-mails.
  Foram cadastrados os quatro.

  IMPORTANTE (segurança): esta lista é uma regra de INTERFACE. A proteção
  real continua sendo profiles.is_admin + RLS no banco. Rode também
  supabase/admins.sql para marcar essas contas como administradoras no
  Supabase (necessário para a RPC admin_listar_clientes()).
*/

const ADMIN_EMAILS = [
  "milenakachimarck@gmail.com",
  "maria.luiza.girelli@gmail.com",
  "mayra.calegario@gmail.com",
  "emanuelle.martins@gmail.com"
];

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

function emailAdmin(valor) {
  return ADMIN_EMAILS.includes(normalizarEmail(valor));
}

function ehAdmin(usuario) {
  if (!usuario) return false;
  return emailAdmin(usuario.email) || usuario.is_admin === true;
}
