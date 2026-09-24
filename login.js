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

async function encerrarSessaoAtual() {
  try {
    await supabaseClient.auth.signOut();
  } catch (error) {
    console.warn("Não foi possível encerrar a sessão atual.", error);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  $("login-error").classList.add("hidden");

  const usuario = $("login-usuario").value.trim();
  const senha = $("login-senha").value;
  const codigoDigitado = $("login-codigo").value.trim().toUpperCase();
  const apenasNumeros = usuario.replace(/\D/g, "");

  try {
    let email = usuario;

    // O cadastro usa e-mail como identificador de autenticação. Para CPF,
    // primeiro resolvemos o e-mail pela função do Supabase e reportamos falhas
    // da RPC em vez de tentar autenticar silenciosamente como se fosse e-mail.
    if (apenasNumeros.length === 11) {
      const { data: infoConta, error: consultaCpfError } = await supabaseClient.rpc(
        "obter_codigo_acesso",
        { identificador: apenasNumeros }
      );

      if (consultaCpfError) {
        console.error("Falha ao consultar o CPF no Supabase:", consultaCpfError);
        mostrarErroLogin("Não foi possível localizar o CPF agora. Tente novamente ou entre com o e-mail cadastrado.");
        return;
      }

      const conta = Array.isArray(infoConta) ? infoConta[0] : infoConta;
      if (!conta?.email) {
        mostrarErroLogin("Conta não encontrada. Confira o CPF ou entre com o e-mail usado no cadastro.");
        return;
      }
      email = conta.email;
    }

    const { data: authData, error: authError } =
      await supabaseClient.auth.signInWithPassword({ email, password: senha });

    if (authError) {
      if (authError.code === "email_not_confirmed") {
        mostrarErroLogin("Confirme seu e-mail antes de entrar.");
      } else if (authError.code === "invalid_credentials") {
        mostrarErroLogin("E-mail/CPF ou senha inválidos. Se ainda não tem conta, clique em “Criar Conta”.");
      } else {
        console.error("Falha de autenticação no Supabase:", authError);
        mostrarErroLogin("Não foi possível autenticar agora. Verifique sua conexão e tente novamente.");
      }
      return;
    }

    if (!authData?.user) {
      mostrarErroLogin("Não foi possível iniciar sua sessão. Tente novamente.");
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

    if (assinaturaError) {
      console.error("Falha ao verificar a assinatura no Supabase:", assinaturaError);
      mostrarErroLogin("Não foi possível verificar sua assinatura agora. Tente novamente.");
      await encerrarSessaoAtual();
      return;
    }

    if (!assinatura) {
      mostrarErroLogin("Nenhuma assinatura ativa. Finalize o pagamento primeiro.");
      await encerrarSessaoAtual();
      return;
    }

    const primeiroAcessoConcluido =
      authData.user.user_metadata?.[PRIMEIRO_ACESSO_KEY] === true;

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

    const dataExpiracao = assinatura.codigo_expira_em
      ? new Date(assinatura.codigo_expira_em)
      : null;
    const expirado = !dataExpiracao || Number.isNaN(dataExpiracao.getTime()) || dataExpiracao < new Date();
    if (codigoDigitado !== String(assinatura.codigo_acesso || "").toUpperCase() || expirado) {
      mostrarCampoCodigo();
      mostrarErroLogin("Código de confirmação inválido ou expirado.");
      return;
    }

    // Marca o primeiro acesso no próprio usuário, para não pedir o código novamente.
    const { error: metadataError } = await supabaseClient.auth.updateUser({
      data: { [PRIMEIRO_ACESSO_KEY]: true }
    });

    if (metadataError) {
      console.error("Falha ao concluir o primeiro acesso:", metadataError);
      mostrarErroLogin("Não foi possível concluir o primeiro acesso. Tente novamente.");
      return;
    }

    limparCodigoSalvo();
    window.location.href = "portal.html";
  } catch (error) {
    console.error("Erro inesperado durante o login:", error);
    mostrarErroLogin("O login não pôde ser concluído por um problema de conexão. Tente novamente.");
  }
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

  try {
    const { data: authData, error: authError } =
      await supabaseClient.auth.signInWithPassword({ email, password: senha });

    if (authError) {
      mostrarErroAdmin("E-mail ou senha inválidos.");
      return;
    }

    if (!authData?.user) {
      mostrarErroAdmin("Não foi possível iniciar sua sessão. Tente novamente.");
      return;
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("is_admin")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("Falha ao verificar permissão de administrador:", profileError);
      mostrarErroAdmin("Não foi possível verificar a permissão desta conta. Tente novamente.");
      await encerrarSessaoAtual();
      return;
    }

    if (!profile?.is_admin) {
      mostrarErroAdmin("Esta conta não tem permissão de administrador.");
      await encerrarSessaoAtual();
      return;
    }

    window.location.href = "admin-clientes.html";
  } catch (error) {
    console.error("Erro inesperado durante o login administrativo:", error);
    mostrarErroAdmin("O login não pôde ser concluído por um problema de conexão. Tente novamente.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  esconderCampoCodigo();
  const codigo = codigoSalvoNoPrimeiroAcesso();
  if (new URLSearchParams(window.location.search).get("primeiro_acesso") === "1" || codigo) {
    mostrarCampoCodigo(codigo);
  }
  if (window.lucide) lucide.createIcons();
});

// Expõe as funções chamadas pelos atributos onsubmit/onclick do HTML.
window.handleLogin = handleLogin;
window.handleAdminLogin = handleAdminLogin;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
