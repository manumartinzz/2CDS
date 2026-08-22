// admin-clientes.js
// Substitui inteiramente a lógica antiga (localStorage + sessionStorage).
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
    alert("Erro ao carregar clientes: " + error.message);
    return;
  }

  clientes = (data || []).map((c) => ({
    id: c.id,
    nome: c.nome || "—",
    cpf: c.cpf || "—",
    email: c.email || "—",
    tel: c.telefone || "—",
    plano: c.plano || "Sem plano",
    status: c.status,
    bloqueado: c.bloqueado
  }));

  renderTabela();
}

// ── Renderização da tabela ────────────────────────────────────────────────────
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

  document.getElementById("total-badge").textContent =
    clientes.length + (clientes.length === 1 ? " cliente" : " clientes");

  if (filtrados.length === 0) {
    tbody.innerHTML = "";
    empty.classList.remove("hidden");
    lucide.createIcons();
    return;
  }
  empty.classList.add("hidden");

  tbody.innerHTML = filtrados
    .map(
      (c) => `
        <tr class="table-row">
            <td class="px-5 py-3.5 font-medium">${c.nome}</td>
            <td class="px-5 py-3.5 text-white/60">${c.cpf}</td>
            <td class="px-5 py-3.5 text-white/60">${c.email}</td>
            <td class="px-5 py-3.5 text-white/60">${c.tel}</td>
            <td class="px-5 py-3.5">${c.plano}</td>
            <td class="px-5 py-3.5">${badgeStatus(c.status)}</td>
            <td class="px-5 py-3.5 text-center">
                <button onclick="abrirModal('${c.id}')"
                        class="text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-semibold">
                    Ver detalhes
                </button>
            </td>
        </tr>
    `
    )
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

  document.getElementById("modal-content").innerHTML = `
        <div class="grid grid-cols-2 gap-x-6">
            <div class="field-group">
                <p class="field-label">Nome completo</p>
                <p class="field-value">${clienteAtivo.nome}</p>
            </div>
            <div class="field-group">
                <p class="field-label">CPF</p>
                <p class="field-value">${clienteAtivo.cpf}</p>
            </div>
            <div class="field-group">
                <p class="field-label">E-mail</p>
                <p class="field-value">${clienteAtivo.email}</p>
            </div>
            <div class="field-group">
                <p class="field-label">Telefone</p>
                <p class="field-value">${clienteAtivo.tel}</p>
            </div>
            <div class="field-group">
                <p class="field-label">Plano</p>
                <p class="field-value">${clienteAtivo.plano}</p>
            </div>
            <div class="field-group">
                <p class="field-label">Status atual</p>
                <p class="field-value">${badgeStatus(clienteAtivo.status)}</p>
            </div>
        </div>
    `;

  const btn = document.getElementById("btn-bloquear");
  if (clienteAtivo.bloqueado) {
    btn.textContent = "Desbloquear cliente";
    btn.className =
      "flex-1 py-2.5 rounded-lg text-sm font-semibold bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors";
  } else {
    btn.textContent = "Bloquear cliente";
    btn.className =
      "flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors";
  }

  document.getElementById("modal").classList.add("open");
  lucide.createIcons();
}

function fecharModal(e) {
  if (e && e.target !== document.getElementById("modal")) return;
  document.getElementById("modal").classList.remove("open");
  clienteAtivo = null;
}

async function toggleBloqueio() {
  if (!clienteAtivo) return;

  const novoValor = !clienteAtivo.bloqueado;

  const { error } = await supabaseClient
    .from("profiles")
    .update({ bloqueado: novoValor })
    .eq("id", clienteAtivo.id);

  if (error) {
    alert("Erro ao atualizar cliente: " + error.message);
    return;
  }

  clienteAtivo.bloqueado = novoValor;
  clienteAtivo.status = novoValor ? "bloqueado" : "pendente";
  const c = clientes.find((x) => x.id === clienteAtivo.id);
  c.bloqueado = novoValor;
  c.status = clienteAtivo.status;

  fecharModal();
  renderTabela();
}