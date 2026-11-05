/*
  admin.js — AcquaSafe · Hub administrativo (admin.html)
  ======================================================
  CORREÇÃO: esta página usava localStorage ("adminLogado") — uma flag que
  NUNCA era gravada por lugar algum — e exibia listas de clientes/doenças
  inventadas em memória. Agora ela usa a mesma proteção das outras telas
  (guardAdmin → sessão Supabase + profiles.is_admin) e apenas direciona
  para os painéis reais.

  Precisa ser carregado DEPOIS de supabase-client.js e admin-guard.js.
*/

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = await guardAdmin();
  if (!usuario) return; // guardAdmin já redirecionou
  if (window.lucide) lucide.createIcons();
});

// Mantém compatibilidade com qualquer link/botão antigo que chame logout().
function logout() {
  return sair();
}
