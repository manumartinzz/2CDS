// pagamento.js
// Substitui inteiramente o pagamento.js antigo (baseado em db.js).
// Precisa ser carregado DEPOIS de supabase-client.js e email-config.js.

const PLANOS = {
  pro: { nome: "Plano Profissional", preco: 89.0 },
  basic: { nome: "Plano Básico", preco: 49.0 },
  enterprise: { nome: "Plano Empresarial", preco: 199.0 }
};

let planoSelecionado = "pro";
let metodoSelecionado = "card";

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});

// -------- Seleção de plano --------
function selectPlan(el) {
  document.querySelectorAll(".plan-card").forEach((card) => {
    card.classList.remove("selected", "border-cyan-500", "bg-cyan-500/10");
    card.classList.add("border-slate-700", "bg-slate-800/50");
  });
  el.classList.add("selected", "border-cyan-500", "bg-cyan-500/10");
  el.classList.remove("border-slate-700", "bg-slate-800/50");

  planoSelecionado = el.dataset.plan;
  const plano = PLANOS[planoSelecionado];

  document.getElementById("summary-plan").textContent = plano.nome;
  document.getElementById("summary-price").textContent =
    "R$ " + plano.preco.toFixed(2).replace(".", ",");
  document.getElementById("summary-total").textContent =
    "R$ " + plano.preco.toFixed(2).replace(".", ",") + "/mês";
}

// -------- Seleção de forma de pagamento --------
function selectMethod(el) {
  document.querySelectorAll(".payment-method").forEach((btn) => {
    btn.classList.remove("active", "border-cyan-500", "bg-cyan-500/10");
    btn.classList.add("border-slate-700");
  });
  el.classList.add("active", "border-cyan-500", "bg-cyan-500/10");
  el.classList.remove("border-slate-700");

  metodoSelecionado = el.dataset.method;

  document.getElementById("form-card").classList.toggle("hidden", metodoSelecionado !== "card");
  document.getElementById("form-pix").classList.toggle("hidden", metodoSelecionado !== "pix");
  document.getElementById("form-boleto").classList.toggle("hidden", metodoSelecionado !== "boleto");
}

// -------- Máscaras dos campos de cartão --------
function formatCard(input) {
  input.value = input.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExp(input) {
  input.value = input.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
}

// -------- Utilitário: gera um código de acesso tipo AQ7F-92XK --------
function gerarCodigoAcesso() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let cod = "AQ";
  for (let i = 0; i < 2; i++) cod += chars[Math.floor(Math.random() * chars.length)];
  cod += "-";
  for (let i = 0; i < 4; i++) cod += chars[Math.floor(Math.random() * chars.length)];
  return cod;
}

// -------- Confirmar pagamento --------
async function handlePayment() {
  const erroBox = document.getElementById("pay-login-erro");
  erroBox.classList.add("hidden");

  // O pagamento exige uma conta já autenticada nesta sessão do navegador
  // (normalmente a pessoa acabou de se cadastrar em cadastro.html, ou já
  // está logada). Sem isso, o banco recusa a gravação por segurança (RLS).
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    erroBox.textContent =
      "Você precisa criar uma conta ou fazer login antes de pagar.";
    erroBox.classList.remove("hidden");
    return;
  }

  const payBtn = document.getElementById("pay-btn");
  payBtn.disabled = true;
  payBtn.querySelector("span").textContent = "Processando...";

  // 1) Busca o plano escolhido
  const { data: plano, error: planoError } = await supabaseClient
    .from("planos")
    .select("id")
    .eq("nome", PLANOS[planoSelecionado].nome)
    .single();

  if (planoError || !plano) {
    erroBox.textContent = "Erro ao localizar o plano. Tente novamente.";
    erroBox.classList.remove("hidden");
    payBtn.disabled = false;
    payBtn.querySelector("span").textContent = "Confirmar Pagamento";
    return;
  }

  const codigo = gerarCodigoAcesso();
  const agora = new Date();
  const expira = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 dias

  // 2) Cria a assinatura já como "ativa" (pagamento simulado/confirmado na hora)
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

  if (assinaturaError) {
    erroBox.textContent = "Erro ao criar assinatura: " + assinaturaError.message;
    erroBox.classList.remove("hidden");
    payBtn.disabled = false;
    payBtn.querySelector("span").textContent = "Confirmar Pagamento";
    return;
  }

  // 3) Registra o pagamento
  const mapaMetodo = { card: "cartao", pix: "pix", boleto: "boleto" };
  await supabaseClient.from("pagamentos").insert({
    assinatura_id: assinatura.id,
    forma: mapaMetodo[metodoSelecionado],
    valor: PLANOS[planoSelecionado].preco,
    status: "aprovado",
    confirmado_em: agora.toISOString()
  });

  // 4) Envia o código por e-mail (usa o EmailJS já configurado em email-config.js)
  if (typeof emailjs !== "undefined" && typeof enviarEmailCodigoAcesso === "function") {
    try {
      await enviarEmailCodigoAcesso(user.email, codigo);
    } catch (e) {
      console.warn("Não foi possível enviar o e-mail automaticamente:", e);
    }
  }

  // 5) Mostra sucesso + código na tela (fallback visual)
  document.getElementById("success-msg").classList.remove("hidden");
  document.getElementById("codigo-gerado-box").classList.remove("hidden");
  document.getElementById("codigo-gerado-valor").textContent = codigo;
  document.getElementById("codigo-gerado-validade").textContent =
    "Válido até " + expira.toLocaleDateString("pt-BR");
  document.getElementById("codigo-gerado-status").textContent = user.email;

  payBtn.querySelector("span").textContent = "Pagamento Confirmado";
}

function copiarCodigo() {
  const codigo = document.getElementById("codigo-gerado-valor").textContent;
  navigator.clipboard.writeText(codigo);
}

// -------- Modal "Reenviar código" --------
function toggleCodeModal() {
  document.getElementById("code-modal").classList.toggle("hidden");
}

async function handleCodeRequest(event) {
  event.preventDefault();

  const erro = document.getElementById("code-erro");
  const sucesso = document.getElementById("code-success");
  erro.classList.add("hidden");
  sucesso.classList.add("hidden");

  const identificador = document.getElementById("reenvio-login").value.trim();

  const { data, error } = await supabaseClient.rpc("obter_codigo_acesso", {
    identificador: identificador
  });

  if (error || !data || data.length === 0) {
    erro.textContent = "Não encontramos uma assinatura ativa para esse e-mail/CPF.";
    erro.classList.remove("hidden");
    return;
  }

  const { codigo_acesso, email } = data[0];

  if (typeof emailjs !== "undefined" && typeof enviarEmailCodigoAcesso === "function") {
    try {
      await enviarEmailCodigoAcesso(email, codigo_acesso);
    } catch (e) {
      console.warn("Não foi possível enviar o e-mail automaticamente:", e);
    }
  }

  sucesso.textContent = "Código reenviado para " + email + ".";
  sucesso.classList.remove("hidden");
}