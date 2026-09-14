// login.js
// O código de acesso é solicitado somente no primeiro acesso após o pagamento.
// Precisa ser carregado DEPOIS de supabase-client.js.

const PRIMEIRO_ACESSO_KEY = "primeiro_acesso_concluido";
const CODIGO_PRIMEIRO_ACESSO_KEY = "acquasafe_codigo_primeiro_acesso";

function $(id) {
  return document.getElementById(id);
}

function mostrarErroLogin(mensagem) {
  const erro = $("login-error");
  erro.textContent = mensagem;
  erro.classList.remove("hidden");
}

function mostrarErroAdmin(mensagem) {
  const erro = $("admin-error");
  erro.textContent = mensagem;
  erro.classList.remove("hidden");
}

function mostrarCampoCodigo(codigo = "") {
  const bloco = $("login-codigo-wrapper");
  const campo = $("login-codigo");
  bloco.classList.remove("hidden");
  campo.required = true;
  if (codigo) campo.value = codigo;
  $("login-codigo-help").textContent =
    "Digite o código exibido após a confirmação do pagamento. Ele será solicitado somente neste primeiro acesso.";
}

function esconderCampoCodigo() {
  const bloco = $("login-codigo-wrapper");
  const campo = $("login-codigo");
  bloco.classList.add("hidden");
  campo.required = false;
  campo.value = "";
}

function codigoSalvoNoPrimeiroAcesso() {
  try {
    return sessionStorage.getItem(CODIGO_PRIMEIRO_ACESSO_KEY) || "";
  } catch (_) {
    return "";
  }
}

function limparCodigoSalvo() {
  try {
    sessionStorage.removeItem(CODIGO_PRIMEIRO_ACESSO_KEY);
  } catch (_) {}
}

async function handleLogin(event) {
  event.preventDefault();
  $("login-error").classList.add("hidden");

  const usuario = $("login-usuario").value.trim();
  const senha = $("login-senha").value;
  const codigoDigitado = $("login-codigo").value.trim().toUpperCase();

  let email = usuario;
  const apenasNumeros = usuario.replace(/\D/g, "");

  if (apenasNumeros.length === 11) {
    const { data: infoConta } = await supabaseClient.rpc("obter_codigo_acesso", {
      identificador: usuario
    });
    if (!infoConta || infoConta.length === 0) {
      mostrarErroLogin("Conta não encontrada. Clique em “Criar Conta” para se cadastrar.");
      return;
    }
    email = infoConta[0].email;
  }

  const { data: authData, error: authError } =
    await supabaseClient.auth.signInWithPassword({ email, password: senha });

  if (authError) {
    mostrarErroLogin("E-mail/CPF ou senha inválidos. Se você ainda não tem conta, clique em “Criar Conta”.");
    return;
  }

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

  const primeiroAcessoConcluido = authData.user.user_metadata?.[PRIMEIRO_ACESSO_KEY] === true;

  if (primeiroAcessoConcluido) {
    limparCodigoSalvo();
    window.location.href = "portal.html";
    return;
  }

  // Na primeira tentativa, autentica apenas com e-mail/senha e revela a etapa do código.
  if (!codigoDigitado) {
    mostrarCampoCodigo(codigoSalvoNoPrimeiroAcesso());
    mostrarErroLogin("Este é seu primeiro acesso. Informe o código recebido após o pagamento.");
    return;
  }

  const expirado = new Date(assinatura.codigo_expira_em) < new Date();
  if (codigoDigitado !== String(assinatura.codigo_acesso).toUpperCase() || expirado) {
    mostrarCampoCodigo();
    mostrarErroLogin("Código de confirmação inválido ou expirado.");
    return;
  }

  // Marca o primeiro acesso no próprio usuário, para não pedir o código novamente.
  const { error: metadataError } = await supabaseClient.auth.updateUser({
    data: { [PRIMEIRO_ACESSO_KEY]: true }
  });

  if (metadataError) {
    mostrarErroLogin("Não foi possível concluir o primeiro acesso. Tente novamente.");
    return;
  }

  limparCodigoSalvo();
  window.location.href = "portal.html";
}

function openAdminModal() {
  $("adminModal").classList.remove("hidden");
}

function closeAdminModal() {
  $("adminModal").classList.add("hidden");
}

async function handleAdminLogin(event) {
  event.preventDefault();
  $("admin-error").classList.add("hidden");

  const email = $("admin-email").value.trim();
  const senha = $("admin-password").value;
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

document.addEventListener("DOMContentLoaded", () => {
  esconderCampoCodigo();
  const codigo = codigoSalvoNoPrimeiroAcesso();
  if (new URLSearchParams(window.location.search).get("primeiro_acesso") === "1" || codigo) {
    mostrarCampoCodigo(codigo);
  }
  if (window.lucide) lucide.createIcons();
});
