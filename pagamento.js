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

function handlePayment() {
    const btn = document.getElementById("pay-btn");
    btn.innerHTML = '<span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>';
    btn.disabled = true;
    setTimeout(() => {
        btn.classList.add("hidden");
        document.getElementById("success-msg").classList.remove("hidden");
        lucide.createIcons();
    }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
});
