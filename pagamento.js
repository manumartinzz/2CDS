/* pagamento.js – AcquaSafe */
const plans = {
    pro:        { name: "Plano Profissional", price: 89 },
    basic:      { name: "Plano Básico",       price: 49 },
    enterprise: { name: "Plano Empresarial",  price: 199 },
};

let selectedPlan   = "pro";
let selectedMethod = "card";

function selectPlan(el) {
    document.querySelectorAll(".plan-card").forEach(c => {
        c.classList.remove("selected", "border-cyan-500", "bg-cyan-500/10", "border-2");
        c.classList.add("border", "border-slate-700", "bg-slate-800/50");
    });
    el.classList.remove("border", "border-slate-700", "bg-slate-800/50");
    el.classList.add("selected", "border-2", "border-cyan-500", "bg-cyan-500/10");
    selectedPlan = el.dataset.plan;
    updateSummary();
}

function selectMethod(el) {
    document.querySelectorAll(".payment-method").forEach(m => {
        m.classList.remove("active", "border-cyan-500", "bg-cyan-500/10", "border-2");
        m.classList.add("border", "border-slate-700");
    });
    el.classList.remove("border", "border-slate-700");
    el.classList.add("active", "border-2", "border-cyan-500", "bg-cyan-500/10");
    selectedMethod = el.dataset.method;

    document.getElementById("form-card").classList.toggle("hidden",   selectedMethod !== "card");
    document.getElementById("form-pix").classList.toggle("hidden",    selectedMethod !== "pix");
    document.getElementById("form-boleto").classList.toggle("hidden", selectedMethod !== "boleto");
}

function updateSummary() {
    const p = plans[selectedPlan];
    document.getElementById("summary-plan").textContent  = p.name;
    document.getElementById("summary-price").textContent = `R$ ${p.price},00`;
    document.getElementById("summary-total").textContent = `R$ ${p.price},00/mês`;
}

function formatCard(el) {
    el.value = el.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}
function formatExp(el) {
    el.value = el.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
}

/* =========================================================
   PAGAMENTO → GERAÇÃO E ENVIO DO CÓDIGO DE ACESSO
   ========================================================= */
async function handlePayment() {
    const loginInput = document.getElementById("pay-login");
    const login = loginInput.value.trim();
    const erroEl = document.getElementById("pay-login-erro");

    if (!login) {
        erroEl.textContent = "Informe o e-mail ou CPF cadastrado para continuar.";
        erroEl.classList.remove("hidden");
        loginInput.focus();
        return;
    }

    let usuario;
    try {
        usuario = await dbEncontrarUsuario(login);
    } catch (error) {
        console.error("Erro ao buscar usuário para pagamento:", error);
        erroEl.textContent = "Não foi possível consultar sua conta agora. Tente novamente.";
        erroEl.classList.remove("hidden");
        return;
    }

    if (!usuario) {
        erroEl.innerHTML = 'Não encontramos cadastro com este e-mail/CPF. <a href="cadastro.html" class="underline text-cyan-300">Cadastre-se primeiro</a>.';
        erroEl.classList.remove("hidden");
        return;
    }
    erroEl.classList.add("hidden");

    const btn = document.getElementById("pay-btn");
    btn.innerHTML = '<span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>';
    btn.disabled = true;

    try {
        // A espera simula a confirmação do gateway enquanto o checkout real
        // ainda não foi conectado.
        await new Promise(resolve => setTimeout(resolve, 1200));
        const plano = plans[selectedPlan];
        const resultado = await dbAtivarPlano(login, { id: selectedPlan, nome: plano.name, preco: plano.price });

        if (!resultado.ok) {
            exibirCodigoConfirmacao(null, null, false, resultado.erro);
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> Tentar novamente';
            if (window.lucide) lucide.createIcons();
            return;
        }

        btn.classList.add("hidden");
        document.getElementById("success-msg").classList.remove("hidden");
        if (window.lucide) lucide.createIcons();

        try {
            const envio = await enviarCodigoPorEmail({
                nome: usuario.nome,
                email: usuario.emailOuCpf,
                codigo: resultado.codigo,
                validade: resultado.validade
            });
            exibirCodigoConfirmacao(resultado.codigo, resultado.validade, envio.enviado);
        } catch (emailError) {
            console.warn("Falha ao enviar o código por e-mail:", emailError);
            exibirCodigoConfirmacao(resultado.codigo, resultado.validade, false);
        }
    } catch (error) {
        console.error("Erro ao ativar plano:", error);
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> Tentar novamente';
        exibirCodigoConfirmacao(null, null, false, "Não foi possível ativar o plano agora.");
        if (window.lucide) lucide.createIcons();
    }
}

function exibirCodigoConfirmacao(codigo, validade, enviadoPorEmail, erro) {
    const box = document.getElementById("codigo-gerado-box");
    if (!box) return;

    if (erro) {
        document.getElementById("codigo-gerado-valor").textContent = "—";
        document.getElementById("codigo-gerado-validade").textContent = "";
        document.getElementById("codigo-gerado-status").textContent = erro;
        box.classList.remove("hidden");
        return;
    }

    const dataFormatada = new Date(validade).toLocaleDateString("pt-BR");
    document.getElementById("codigo-gerado-valor").textContent = codigo;
    document.getElementById("codigo-gerado-validade").textContent = `Válido até ${dataFormatada}`;
    document.getElementById("codigo-gerado-status").textContent = enviadoPorEmail
        ? "Confirmamos o envio deste código para o seu e-mail."
        : "Não foi possível confirmar o envio por e-mail agora — guarde este código.";
    box.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
}

function copiarCodigo() {
    const valor = document.getElementById("codigo-gerado-valor").textContent;
    if (!valor || valor === "—") return;
    navigator.clipboard.writeText(valor).catch(() => {});
}

/* =========================================================
   REENVIO DE CÓDIGO (modal "Reenviar código")
   ========================================================= */
function toggleCodeModal() {
    const modal = document.getElementById('code-modal');
    modal.classList.toggle('hidden');
    document.getElementById('code-success').classList.add('hidden');
    document.getElementById('code-erro').classList.add('hidden');
}

async function handleCodeRequest(e) {
    e.preventDefault();
    const login = document.getElementById('reenvio-login').value.trim();
    const msgEl = document.getElementById('code-success');
    const erroEl = document.getElementById('code-erro');

    let usuario;
    try {
        usuario = await dbEncontrarUsuario(login);
    } catch (error) {
        console.error('Erro ao buscar código:', error);
        usuario = null;
    }

    if (!usuario || !usuario.codigoAcesso) {
        erroEl.textContent = 'Nenhum plano ativo encontrado para este e-mail/CPF. Entre na sua conta para reenviar o código.';
        erroEl.classList.remove('hidden');
        msgEl.classList.add('hidden');
        return;
    }

    if (new Date() > new Date(usuario.codigoValidade)) {
        erroEl.textContent = 'Seu código expirou. Assine novamente para gerar um novo.';
        erroEl.classList.remove('hidden');
        msgEl.classList.add('hidden');
        return;
    }

    erroEl.classList.add('hidden');

    const { enviado } = await enviarCodigoPorEmail({
        nome: usuario.nome,
        email: usuario.emailOuCpf,
        codigo: usuario.codigoAcesso,
        validade: usuario.codigoValidade
    });
    msgEl.textContent = enviado
        ? 'Código reenviado para o seu e-mail!'
        : `Não conseguimos confirmar o envio por e-mail. Seu código é: ${usuario.codigoAcesso}`;
    msgEl.classList.remove('hidden');
    e.target.reset();
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) lucide.createIcons();

    // Se veio do cadastro, já preenche o e-mail/CPF automaticamente
    const pendente = sessionStorage.getItem('acqua_cadastro_pendente');
    if (pendente) {
        const loginInput = document.getElementById('pay-login');
        if (loginInput) loginInput.value = pendente;
        sessionStorage.removeItem('acqua_cadastro_pendente');
    }
});
