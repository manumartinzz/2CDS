// admin-guard.js
// Compartilhado por admin-clientes.html, admin-doencas.html e admin-bloqueios.html.
// Precisa ser carregado DEPOIS de supabase-client.js e ANTES do script de cada página.

// Espera a sessão terminar de carregar do navegador antes de decidir
// se redireciona para o login. Evita o "pisca e volta pro login".
async function obterSessaoComEspera(tentativas = 6) {
  for (let i = 0; i < tentativas; i++) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) return session;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

// Confere sessão + is_admin. Redireciona sozinho se algo falhar.
// Retorna o usuário logado (ou null, se já redirecionou).
async function guardAdmin() {
  const session = await obterSessaoComEspera();

  if (!session) {
    window.location.href = "login-admin.html";
    return null;
  }

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (error || !profile?.is_admin) {
    alert("Acesso negado. Faça login como administrador.");
    await supabaseClient.auth.signOut();
    window.location.href = "login-admin.html";
    return null;
  }

  document.body.classList.remove("opacity-0");
  return session.user;
}

async function sair() {
  await supabaseClient.auth.signOut();
  window.location.href = "login-admin.html";
}