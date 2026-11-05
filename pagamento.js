/*
  pagamento.js — AcquaSafe · Finalizar Pagamento
  =============================================
  AMBIENTE DE DEMONSTRAÇÃO: não há gateway de pagamento. Nenhum cartão é
  cobrado e os dados digitados não são enviados a lugar algum — eles são
  apenas validados localmente. A assinatura é criada como "ativa" pelo
  próprio navegador, protegida pelas policies de RLS (ver supabase/schema.sql).
  Em produção, substitua por um checkout real + confirmação no servidor.

  Precisa ser carregado DEPOIS de supabase-client.js e email-config.js.
*/

const PLANOS = {
  pro: { nome: "Plano Profissional", preco: 89.0 },
  basic: { nome: "Plano Básico", preco: 49.0 },
  enterprise: { nome: "Plano Empresarial", preco: 199.0 }
};

let planoSelecionado = "pro";
let metodoSelecionado = "card";
let processando = false;

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});

/* -------------------- Seleção de plano / método -------------------- */

function selectPlan(el) {
  document.querySelectorAll(".plan-card").forEach((card) => {
    card.classList.remove("selected", "border-cyan-500", "bg-cyan-500/10");
    card.classList.add("border-slate-700", "bg-slate-800/50");
  });
  el.classList.add("selected", "border-cyan-500", "bg-cyan-500/10");
  el.classList.remove("border-slate-700", "bg-slate-800/50");

  planoSelecionado = el.dataset.plan;
  const plano = PLANOS[planoSelecionado];
  if (!plano) return;

  $("summary-plan").textContent = plano.nome;
  $("summary-price").textContent = "R$ " + plano.preco.toFixed(2).replace(".", ",");
  $("summary-total").textContent = "R$ " + plano.preco.toFixed(2).replace(".", ",") + "/mês";
}

function selectMethod(el) {
  document.querySelectorAll(".payment-method").forEach((btn) => {
    btn.classList.remove("active", "border-cyan-500", "bg-cyan-500/10");
    btn.classList.add("border-slate-700");
  });
  el.classList.add("active", "border-cyan-500", "bg-cyan-500/10");
  el.classList.remove("border-slate-700");

  metodoSelecionado = el.dataset.method;

  $("form-card").classList.toggle("hidden", metodoSelecionado !== "card");
  $("form-pix").classList.toggle("hidden", metodoSelecionado !== "pix");
  $("form-boleto").classList.toggle("hidden", metodoSelecionado !== "boleto");
}

/* -------------------- Máscaras -------------------- */

function formatCard(input) {
  input.value = input.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExp(input) {
  input.value = input.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
}

/* -------------------- Código de acesso -------------------- */

function gerarCodigoAcesso() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let cod = "AQ";
  for (let i = 0; i < 2; i++) cod += chars[Math.floor(Math.random() * chars.length)];
  cod += "-";
  for (let i = 0; i < 4; i++) cod += chars[Math.floor(Math.random() * chars.length)];
  return cod;
}

/* -------------------- Validação local -------------------- */

function validarPagamento() {
  const identificacao = ($("pay-login")?.value || "").trim();
  if (!identificacao) return "Informe seu e-mail ou CPF.";

  if (!PLANOS[planoSelecionado]) return "Selecione um plano válido.";

  if (metodoSelecionado === "card") {
    const nome = ($("card-name")?.value || "").trim();
    const numero = ($("card-num")?.value || "").replace(/\D/g, "");
    const validade = ($("card-exp")?.value || "").trim();
    const cvv = ($("card-cvv")?.value || "").trim();

    if (nome.length < 2) return "Informe o nome impresso no cartão.";
    if (numero.length < 13 || numero.length > 19) return "Informe um número de cartão válido.";
    if (!/^\d{2}\/\d{2}$/.test(validade)) return "Informe a validade no formato MM/AA.";

    const [mm, aa] = validade.split("/").map(Number);
    if (mm < 1 || mm > 12) return "Mês de validade inválido.";
    const agora = new Date();
    const ano = 2000 + aa;
    if (ano < agora.getFullYear() ||
        (ano === agora.getFullYear() && mm < agora.getMonth() + 1)) {
      return "Este cartão está vencido.";
    }
    if (!/^\d{3,4}$/.test(cvv)) return "Informe o CVV (3 ou 4 dígitos).";
  }
  // PIX e boleto não têm campos obrigatórios nesta demonstração.
  return null;
}

/* -------------------- UI -------------------- */

function setBotao(texto, desabilitado) {
  const btn = $("pay-btn");
  if (!btn) return;
  btn.disabled = desabilitado;
  const span = btn.querySelector("span");
  if (span) span.textContent = texto;
}

function mostrarErro(mensagem) {
  const box = $("pay-login-erro");
  if (!box) return;
  box.textContent = mensagem;
  box.classList.remove("hidden");
}

function mostrarCodigo(codigo, expira, email, enviado, jaExistia) {
  $("success-msg").classList.remove("hidden");
  $("codigo-gerado-box").classList.remove("hidden");
  $("codigo-gerado-valor").textContent = codigo;
  $("codigo-gerado-validade").textContent = "Válido até " + expira.toLocaleDateString("pt-BR");
  $("codigo-gerado-status").textContent = email;

  const status = $("success-email-status");
  if (status) {
    status.textContent = enviado
      ? "Enviamos seu código de acesso por e-mail."
      : "Não foi possível enviar o e-mail — use o código abaixo no primeiro acesso.";
  }
  const titulo = $("success-msg")?.querySelector("p");
  if (titulo && jaExistia) titulo.textContent = "Você já tem uma assinatura ativa!";
}

/* -------------------- Confirmar pagamento -------------------- */

async function handlePayment() {
  if (processando) return; // evita duplo clique / assinaturas duplicadas
  $("pay-login-erro").classList.add("hidden");

  const erroValidacao = validarPagamento();
  if (erroValidacao) { mostrarErro(erroValidacao); return; }

  const { data: { user }, error: erroAuth } = await supabaseClient.auth.getUser();
  if (!user) {
    // Qualquer link direto para pagamento.html (landing, login, favorito) cai
    // aqui. Em vez de só mostrar um erro, leva ao início do fluxo correto.
    mostrarErro("Você precisa criar uma conta antes de pagar. Redirecionando para o cadastro…");
    setTimeout(() => { window.location.href = "cadastro.html"; }, 1600);
    return;
  }
  if (erroAuth) {
    mostrarErro("Não foi possível verificar sua sessão. Faça login novamente.");
    return;
  }

  processando = true;
  setBotao("Processando...", true);

  try {
    // 1) Já existe assinatura ativa? Reaproveita o código em vez de criar outra.
    const { data: existente, error: erroConsulta } = await supabaseClient
      .from("assinaturas")
      .select("id, codigo_acesso, codigo_expira_em")
      .eq("user_id", user.id)
      .eq("status", "ativa")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (erroConsulta) throw new Error("Erro ao consultar assinatura: " + erroConsulta.message);

    if (existente?.codigo_acesso) {
      const expira = new Date(existente.codigo_expira_em || Date.now() + 30 * 86400000);
      let enviado = false;
      if (typeof enviarEmailCodigoAcesso === "function") {
        enviado = !!(await enviarEmailCodigoAcesso(user.email, existente.codigo_acesso, {
          nome: user.user_metadata?.nome_completo || user.email,
          validade: expira.toISOString()
        }))?.enviado;
      }
      mostrarCodigo(existente.codigo_acesso, expira, user.email, enviado, true);
      setBotao("Assinatura já ativa", true);
      return;
    }

    // 2) Busca o plano escolhido
    const { data: plano, error: planoError } = await supabaseClient
      .from("planos")
      .select("id")
      .eq("nome", PLANOS[planoSelecionado].nome)
      .single();
    if (planoError || !plano) throw new Error("Erro ao localizar o plano. Rode supabase/schema.sql.");

    const codigo = gerarCodigoAcesso();
    const agora = new Date();
    const expira = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 3) Cria a assinatura (pagamento simulado)
    const { data: assinatura, error: assinaturaError } = await supabaseClient
      .from("assinaturas")
      .insert({
        user_id: user.id,
        plano_id: plano.id,
        status: "ativa",
        codigo_acesso: codigo,
        codigo_gerado_em: agora.toISOString(),
        codigo_expira_em: expira.toISOString(),
        data_inicio: agora.toISOString()
      })
      .select()
      .single();
    if (assinaturaError) throw new Error("Erro ao criar assinatura: " + assinaturaError.message);

    // 4) Registra o pagamento; se falhar, desfaz a assinatura para não
    //    deixar uma assinatura ativa sem pagamento correspondente.
    const mapaMetodo = { card: "cartao", pix: "pix", boleto: "boleto" };
    const { error: erroPagamento } = await supabaseClient.from("pagamentos").insert({
      assinatura_id: assinatura.id,
      forma: mapaMetodo[metodoSelecionado],
      valor: PLANOS[planoSelecionado].preco,
      status: "aprovado",
      confirmado_em: agora.toISOString()
    });
    if (erroPagamento) {
      await supabaseClient.from("assinaturas").delete().eq("id", assinatura.id);
      throw new Error("Erro ao registrar pagamento: " + erroPagamento.message);
    }

    // 5) Envia o código por e-mail (função agora existe em email-config.js)
    let enviado = false;
    if (typeof enviarEmailCodigoAcesso === "function") {
      const resultado = await enviarEmailCodigoAcesso(user.email, codigo, {
        nome: user.user_metadata?.nome_completo || user.email,
        validade: expira.toISOString()
      });
      enviado = !!resultado?.enviado;
    }

    // 6) Mostra sucesso + código na tela (fallback visual honesto)
    mostrarCodigo(codigo, expira, user.email, enviado, false);
    setBotao("Pagamento Confirmado", true);
  } catch (err) {
    console.error("Falha no pagamento:", err);
    mostrarErro(err.message || "Não foi possível concluir o pagamento.");
    setBotao("Confirmar Pagamento", false);
  } finally {
    processando = false;
  }
}

function copiarCodigo() {
  const codigo = $("codigo-gerado-valor").textContent;
  try { sessionStorage.setItem("acquasafe_codigo_primeiro_acesso", codigo); } catch (_) {}

  const irParaLogin = () => { window.location.href = "login.html?primeiro_acesso=1"; };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(codigo).then(irParaLogin).catch(irParaLogin);
  } else {
    irParaLogin();
  }
}

/* -------------------- Reenviar código -------------------- */

function toggleCodeModal() {
  $("code-modal").classList.toggle("hidden");
}

async function handleCodeRequest(event) {
  event.preventDefault();
  const erro = $("code-erro");
  const sucesso = $("code-success");
  erro.classList.add("hidden");
  sucesso.classList.add("hidden");

  const identificador = $("reenvio-login").value.trim();
  if (!identificador) {
    erro.textContent = "Informe seu e-mail ou CPF.";
    erro.classList.remove("hidden");
    return;
  }

  try {
    const { data, error } = await supabaseClient.rpc("obter_codigo_acesso", {
      identificador: identificador
    });

    const conta = Array.isArray(data) ? data[0] : data;
    const codigo = String(conta?.codigo_acesso || "").trim().toUpperCase();
    if (error || !conta?.email || !codigo) {
      erro.textContent = "Não encontramos uma assinatura ativa com código para esse e-mail/CPF.";
      erro.classList.remove("hidden");
      return;
    }

    let enviado = false;
    if (typeof enviarEmailCodigoAcesso === "function") {
      const resultado = await enviarEmailCodigoAcesso(conta.email, codigo, {
        nome: conta.nome_completo || conta.email,
        validade: conta.codigo_expira_em
      });
      enviado = !!resultado?.enviado;
    }

    // Fallback: mesmo que o e-mail falhe ou chegue sem código, o código
    // aparece aqui (igual à tela de pagamento). Ver "Limitações" no README.
    sucesso.textContent = enviado
      ? "Código reenviado para " + conta.email + ". Seu código: " + codigo
      : "Não foi possível enviar o e-mail. Seu código é: " + codigo;
    sucesso.classList.remove("hidden");
  } catch (err) {
    console.error("Falha ao reenviar código:", err);
    erro.textContent = "Não foi possível reenviar agora. Tente novamente.";
    erro.classList.remove("hidden");
  }
}
