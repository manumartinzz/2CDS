/* =========================================================
   admin.js  –  AcquaSafe  –  Painel Administrativo
   ========================================================= */

/* ── Proteção da rota ── */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("listaClientes") !== null) {
        if (localStorage.getItem("adminLogado") !== "true") {
            window.location.href = "login-admin.html";
            return;
        }
        renderDoencas();
        renderClientes();
    }

    if (window.lucide) window.lucide.createIcons();
});

/* =========================================================
   LOGOUT
   ========================================================= */
function logout() {
    localStorage.removeItem("adminLogado");
    window.location.href = "login-admin.html";
}

/* =========================================================
   DOENÇAS
   ========================================================= */
let doencas = ["Mofo-branco", "Antracnose", "Míldio"];

function renderDoencas() {
    const lista = document.getElementById("listaDoencas");
    if (!lista) return;

    lista.innerHTML = doencas
        .map(
            (d, i) => `
        <li>
            <span>${d}</span>
            <button class="btn-gradient" onclick="removerDoenca(${i})">Excluir</button>
        </li>`
        )
        .join("");
}

function adicionarDoenca() {
    const campo = document.getElementById("novaDoenca");
    if (!campo) return;

    const valor = campo.value.trim();
    if (!valor) { alert("Digite o nome da doença."); return; }

    doencas.push(valor);
    campo.value = "";
    renderDoencas();
}

function removerDoenca(index) {
    doencas.splice(index, 1);
    renderDoencas();
}

/* =========================================================
   CLIENTES
   ========================================================= */
const clientes = [
    { nome: "Fazenda Esperança", status: "Pago" },
    { nome: "Agro Silva",        status: "Inadimplente" },
    { nome: "Campo Verde",       status: "Pago" },
];

function renderClientes() {
    const lista = document.getElementById("listaClientes");
    if (!lista) return;

    lista.innerHTML = clientes
        .map(
            (c) => `
        <li>
            <div><strong>${c.nome}</strong></div>
            <div class="acoes">
                <span class="${c.status === "Pago" ? "status-ok" : "status"}">
                    ${c.status}
                </span>
                ${
                    c.status === "Inadimplente"
                        ? `<button class="btn-gradient" onclick="bloquearCliente('${c.nome}')">Bloquear</button>`
                        : ""
                }
            </div>
        </li>`
        )
        .join("");
}

function bloquearCliente(nome) {
    alert(`${nome} foi bloqueado por falta de pagamento.`);
}
