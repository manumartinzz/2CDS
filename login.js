// login.js
// Substitui inteiramente o login.js antigo (baseado em db.js).
// Precisa ser carregado DEPOIS de supabase-client.js.

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});

function openAdminModal() {
  document.getElementById("adminModal").classList.remove("hidden");
}

function closeAdminModal() {
  document.getElementById("adminModal").classList.add("hidden");
}

function mostrarErroLogin(mensagem) {
  const erro = document.getElementById("login-error");
  erro.textContent = mensagem;
  erro.classList.remove("hidden");
}

function mostrarErroAdmin(mensagem) {
  const erro = document.getElementById("admin-error");
  erro.textContent = mensagem;
  erro.classList.remove("hidden");
}

async function handleLogin(event) {
  event.preventDefault();
  document.getElementById("login-error").classList.add("hidden");

  const usuario = document.getElementById("login-usuario").value.trim();
  const senha = document.getElementById("login-senha").value;
  const codigoDigitado = document.getElementById("login-codigo").value.trim();

  // O Supabase Auth loga com e-mail. Se o campo tiver CPF, buscamos
  // o e-mail correspondente via a função RPC (não expõe outros dados).
  const apenasNumeros = usuario.replace(/\D/g, "");
  let email = usuario;

  if (apenasNumeros.length === 11) {
    const { data: infoConta } = await supabaseClient.rpc("obter_codigo_acesso", {
      identificador: usuario
    });
    if (!infoConta || infoConta.length === 0) {
      mostrarErroLogin("CPF não encontrado.");
      return;
    }
    email = infoConta[0].email;
  }

  const { data: authData, error: authError } =
    await supabaseClient.auth.signInWithPassword({ email, password: senha });

  if (authError) {
    // Mostrando a mensagem real do Supabase por enquanto, pra facilitar o diagnóstico.
    // Depois que tudo estiver funcionando, pode trocar por um texto genérico se preferir.
    mostrarErroLogin(authError.message);
    return;
  }

  // Confere assinatura ativa + código de confirmação
  const { data: assinatura, error: assinaturaError } = await supabaseClient
    .from("assinaturas")
    .select("status, codigo_acesso, codigo_expira_em")
    .eq("user_id", authData.user.id)
    .eq("status", "ativa")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assinaturaError || !assinatura) {
    mostrarErroLogin("Nenhuma assinatura ativa. Finalize o pagamento primeiro.");
    await supabaseClient.auth.signOut();
    return;
  }

  const expirado = new Date(assinatura.codigo_expira_em) < new Date();
  if (codigoDigitado !== assinatura.codigo_acesso || expirado) {
    mostrarErroLogin("Código de confirmação inválido ou expirado.");
    await supabaseClient.auth.signOut();
    return;
  }

  window.location.href = "portal.html";
}

async function handleAdminLogin(event) {
  event.preventDefault();
  document.getElementById("admin-error").classList.add("hidden");

  const email = document.getElementById("admin-email").value.trim();
  const senha = document.getElementById("admin-password").value;

  const { data: authData, error: authError } =
    await supabaseClient.auth.signInWithPassword({ email, password: senha });

  if (authError) {
    mostrarErroAdmin("E-mail ou senha inválidos.");
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("is_admin")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    mostrarErroAdmin("Esta conta não tem permissão de administrador.");
    await supabaseClient.auth.signOut();
    return;
  }

  window.location.href = "admin-clientes.html";
}