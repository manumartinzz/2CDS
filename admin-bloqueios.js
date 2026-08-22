// admin-bloqueios.js
// Substitui inteiramente a lógica antiga (localStorage).
// Precisa ser carregado DEPOIS de supabase-client.js e admin-guard.js.

let clientes = [];
let clienteAtivo = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const user = await guardAdmin();
  if (!user) return;

  lucide.createIcons();

  await carregarClientes();

  document.getElementById("busca").addEventListener("input", renderTabela);
  document.getElementById("filtro-status").addEventListener("change", renderTabela);
}

async function carregarClientes() {
  const { data, error } = await supabaseClient.rpc("admin_listar_clientes");

  if (error) {
    showToast("Erro ao carregar clientes: " + error.message, "error");
    return;
  }

  clientes = (data || []).map((c) => ({
    id: c.id,
    nome: c.nome || "—",
    cpf: c.cpf || "—",
    email: c.email || "—",
    plano: c.plano || "Sem plano",
    status: c.status,
    bloqueado: c.bloqueado,
    motivo: c.motivo_bloqueio || ""
  }));

  renderTabela();
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function atualizarStats() {
  document.getElementById("stat-total").textContent = clientes.length;
  document.getElementById("stat-ativo").textContent = clientes.filter((c) => c.status === "ativo").length;
  document.getElementById("stat-pend").textContent = clientes.filter((c) => c.status === "pendente").length;
  document.getElementById("stat-bloq").textContent = clientes.filter((c) => c.status === "bloqueado").length;
}

// ── Tabela ────────────────────────────────────────────────────────────────────
function renderTabela() {
  const busca = document.getElementById("busca").value.toLowerCase();
  const filtro = document.getElementById("filtro-status").value;

  const filtrados = clientes.filter((c) => {
    const match =
      c.nome.toLowerCase().includes(busca) ||
      c.cpf.includes(busca) ||
      c.email.toLowerCase().includes(busca);
    const statusOk = !filtro || c.status === filtro;
    return match && statusOk;
  });

  const tbody = document.getElementById("tabela-body");
  const empty = document.getElementById("empty-state");

  atualizarStats();

  if (filtrados.length === 0) {
    tbody.innerHTML = "";
    empty.classList.remove("hidden");
    lucide.createIcons();
    return;
  }
  empty.classList.add("hidden");

  tbody.innerHTML = filtrados
    .map((c) => {
      const isBloq = c.status === "bloqueado";
      const btnClass = isBloq
        ? "px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors flex items-center gap-1"
        : "px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors flex items-center gap-1";
      const btnIcon = isBloq ? "unlock" : "ban";
      const btnLabel = isBloq ? "Desbloquear" : "Bloquear";

      const situacao = c.motivo
        ? `<span class="text-white/50 text-xs">${c.motivo}</span>`
        : `<span class="text-white/25 text-xs">—</span>`;

      return `
        <tr class="table-row">
            <td class="px-5 py-3.5 font-medium">${c.nome}</td>
            <td class="px-5 py-3.5 text-white/60">${c.cpf}</td>
            <td class="px-5 py-3.5">${c.plano}</td>
            <td class="px-5 py-3.5">${situacao}</td>
            <td class="px-5 py-3.5">${badgeStatus(c.status)}</td>
            <td class="px-5 py-3.5">
                <div class="flex justify-center">
                    <button onclick="abrirModal('${c.id}')" class="${btnClass}">
                        <i data-lucide="${btnIcon}" class="w-3.5 h-3.5"></i>
                        ${btnLabel}
                    </button>
                </div>
            </td>
        </tr>`;
    })
    .join("");
  lucide.createIcons();
}

function badgeStatus(s) {
  const map = {
    ativo: '<span class="badge badge-ativo">● Ativo</span>',
    bloqueado: '<span class="badge badge-bloq">● Bloqueado</span>',
    pendente: '<span class="badge badge-pend">● Pendente</span>'
  };
  return map[s] || s;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function abrirModal(id) {
  clienteAtivo = clientes.find((c) => c.id === id);
  if (!clienteAtivo) return;

  const isBloq = clienteAtivo.status === "bloqueado";
  const iconWrap = document.getElementById("modal-icon-wrap");
  const icon = document.getElementById("modal-icon");
  const titulo = document.getElementById("modal-titulo");
  const desc = document.getElementById("modal-desc");
  const btnConf = document.getElementById("btn-confirmar");
  const motivoW = document.getElementById("motivo-wrap");

  if (isBloq) {
    iconWrap.className = "w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4";
    icon.setAttribute("data-lucide", "unlock");
    titulo.textContent = "Desbloquear Cliente";
    desc.textContent = `Deseja desbloquear ${clienteAtivo.nome}? O acesso será restaurado imediatamente.`;
    btnConf.textContent = "Sim, desbloquear";
    btnConf.className =
      "flex-1 py-2.5 rounded-lg text-sm font-semibold bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors";
    motivoW.classList.add("hidden");
  } else {
    iconWrap.className = "w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4";
    icon.setAttribute("data-lucide", "ban");
    titulo.textContent = "Bloquear Cliente";
    desc.textContent = `Deseja bloquear ${clienteAtivo.nome}? O acesso será suspenso até novo aviso.`;
    btnConf.textContent = "Sim, bloquear";
    btnConf.className =
      "flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors";
    motivoW.classList.remove("hidden");
    document.getElementById("motivo-sel").value = "Inadimplência";
  }

  document.getElementById("modal").classList.add("open");
  lucide.createIcons();
}

function fecharModal(e) {
  if (e && e.target !== document.getElementById("modal")) return;
  document.getElementById("modal").classList.remove("open");
  clienteAtivo = null;
}

async function confirmarAcao() {
  if (!clienteAtivo) return;

  const vaiDesbloquear = clienteAtivo.status === "bloqueado";
  const novoBloqueado = !vaiDesbloquear;
  const novoMotivo = vaiDesbloquear ? null : document.getElementById("motivo-sel").value;

  const { error } = await supabaseClient
    .from("profiles")
    .update({ bloqueado: novoBloqueado, motivo_bloqueio: novoMotivo })
    .eq("id", clienteAtivo.id);

  if (error) {
    showToast("Erro ao atualizar cliente: " + error.message, "error");
    return;
  }

  if (vaiDesbloquear) {
    showToast(`${clienteAtivo.nome} foi desbloqueado.`, "success");
  } else {
    showToast(`${clienteAtivo.nome} foi bloqueado por ${novoMotivo}.`, "info");
  }

  document.getElementById("modal").classList.remove("open");
  clienteAtivo = null;
  await carregarClientes();
}

// ── Bloquear todos os pendentes ───────────────────────────────────────────────
async function bloquearTodosPendentes() {
  const pendentes = clientes.filter((c) => c.status === "pendente");
  if (pendentes.length === 0) {
    showToast("Não há clientes pendentes.", "info");
    return;
  }

  const ids = pendentes.map((c) => c.id);

  const { error } = await supabaseClient
    .from("profiles")
    .update({ bloqueado: true, motivo_bloqueio: "Inadimplência" })
    .in("id", ids);

  if (error) {
    showToast("Erro ao bloquear clientes: " + error.message, "error");
    return;
  }

  showToast(`${pendentes.length} cliente(s) bloqueado(s) por inadimplência.`, "info");
  await carregarClientes();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, tipo) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + tipo;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}