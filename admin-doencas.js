// admin-doencas.js
// Gerencia o catálogo de patógenos (tabela "doencas" no banco).
// Precisa ser carregado DEPOIS de supabase-client.js e admin-guard.js.

let doencas = [];
let editandoId = null;
let removendoId = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const user = await guardAdmin();
  if (!user) return;

  lucide.createIcons();

  await carregarDoencas();

  document.getElementById("busca").addEventListener("input", renderLista);
  document.getElementById("filtro-tipo").addEventListener("change", renderLista);
}

async function carregarDoencas() {
  const { data, error } = await supabaseClient
    .from("doencas")
    .select("id, nome, tipo, grupo_risco, doenca_associada, orgao_afetado, nivel_bsl")
    .order("nome", { ascending: true });

  if (error) {
    showToast("Erro ao carregar doenças: " + error.message, "error");
    return;
  }

  doencas = data || [];
  renderLista();
}

// ── Renderização ──────────────────────────────────────────────────────────────
function renderLista() {
  const busca = document.getElementById("busca").value.toLowerCase();
  const filtro = document.getElementById("filtro-tipo").value;

  const filtrados = doencas.filter((d) => {
    const match =
      (d.nome || "").toLowerCase().includes(busca) ||
      (d.doenca_associada || "").toLowerCase().includes(busca) ||
      (d.orgao_afetado || "").toLowerCase().includes(busca);
    const tipoOk = !filtro || d.tipo === filtro;
    return match && tipoOk;
  });

  const lista = document.getElementById("lista-doencas");
  const empty = document.getElementById("empty-state");
  const cont = document.getElementById("contador");

  cont.textContent = `${filtrados.length} de ${doencas.length} patógeno(s)`;

  if (filtrados.length === 0) {
    lista.innerHTML = "";
    empty.classList.remove("hidden");
    lucide.createIcons();
    return;
  }
  empty.classList.add("hidden");

  lista.innerHTML = filtrados
    .map(
      (d) => `
        <div class="doenca-card">
            <div class="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i data-lucide="shield-alert" class="w-4 h-4 text-blue-400"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-sm italic">${d.nome}</span>
                    ${d.tipo ? `<span class="badge-cat">${d.tipo}</span>` : ""}
                    ${d.grupo_risco ? `<span class="badge-cat">GR${d.grupo_risco}</span>` : ""}
                    ${d.nivel_bsl ? `<span class="badge-cat">${d.nivel_bsl}</span>` : ""}
                </div>
                ${d.doenca_associada ? `<p class="text-white/70 text-xs mt-1">${d.doenca_associada}</p>` : ""}
                ${d.orgao_afetado ? `<p class="text-white/40 text-xs mt-0.5">Órgão afetado: ${d.orgao_afetado}</p>` : ""}
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="abrirModalEditar('${d.id}')"
                        class="p-1.5 rounded-lg text-white/40 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                        title="Editar">
                    <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button onclick="pedirRemocao('${d.id}')"
                        class="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Remover">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `
    )
    .join("");
  lucide.createIcons();
}

// ── Modal adicionar / editar ──────────────────────────────────────────────────
function abrirModalAdicionar() {
  editandoId = null;
  document.getElementById("modal-titulo").textContent = "Novo Patógeno";
  document.getElementById("f-nome").value = "";
  document.getElementById("f-tipo").value = "";
  document.getElementById("f-risco").value = "";
  document.getElementById("f-doenca").value = "";
  document.getElementById("f-orgao").value = "";
  document.getElementById("f-bsl").value = "";
  document.getElementById("modal").classList.add("open");
  setTimeout(() => document.getElementById("f-nome").focus(), 100);
  lucide.createIcons();
}

function abrirModalEditar(id) {
  const d = doencas.find((x) => x.id === id);
  if (!d) return;
  editandoId = id;
  document.getElementById("modal-titulo").textContent = "Editar Patógeno";
  document.getElementById("f-nome").value = d.nome || "";
  document.getElementById("f-tipo").value = d.tipo || "";
  document.getElementById("f-risco").value = d.grupo_risco || "";
  document.getElementById("f-doenca").value = d.doenca_associada || "";
  document.getElementById("f-orgao").value = d.orgao_afetado || "";
  document.getElementById("f-bsl").value = d.nivel_bsl || "";
  document.getElementById("modal").classList.add("open");
  setTimeout(() => document.getElementById("f-nome").focus(), 100);
  lucide.createIcons();
}

function fecharModal(e) {
  if (e && e.target !== document.getElementById("modal")) return;
  document.getElementById("modal").classList.remove("open");
}

async function salvarDoenca() {
  const nome = document.getElementById("f-nome").value.trim();
  const tipo = document.getElementById("f-tipo").value;
  const grupo_risco = document.getElementById("f-risco").value;
  const doenca_associada = document.getElementById("f-doenca").value.trim();
  const orgao_afetado = document.getElementById("f-orgao").value.trim();
  const nivel_bsl = document.getElementById("f-bsl").value;

  if (!nome) {
    showToast("Informe o nome do patógeno.", "error");
    document.getElementById("f-nome").focus();
    return;
  }

  const payload = { nome, tipo, grupo_risco, doenca_associada, orgao_afetado, nivel_bsl };

  if (editandoId) {
    const { error } = await supabaseClient.from("doencas").update(payload).eq("id", editandoId);
    if (error) {
      showToast("Erro ao atualizar: " + error.message, "error");
      return;
    }
    showToast("Patógeno atualizado com sucesso!", "success");
  } else {
    const { error } = await supabaseClient.from("doencas").insert(payload);
    if (error) {
      showToast("Erro ao adicionar: " + error.message, "error");
      return;
    }
    showToast("Patógeno adicionado com sucesso!", "success");
  }

  document.getElementById("modal").classList.remove("open");
  await carregarDoencas();
}

// ── Modal remover ─────────────────────────────────────────────────────────────
function pedirRemocao(id) {
  removendoId = id;
  const d = doencas.find((x) => x.id === id);
  document.getElementById("del-nome").textContent = d ? d.nome : "";
  document.getElementById("modal-del").classList.add("open");
  lucide.createIcons();
}

function fecharModalDel(e) {
  if (e && e.target !== document.getElementById("modal-del")) return;
  document.getElementById("modal-del").classList.remove("open");
  removendoId = null;
}

async function confirmarRemocao() {
  const { error } = await supabaseClient.from("doencas").delete().eq("id", removendoId);

  if (error) {
    showToast("Erro ao remover: " + error.message, "error");
    return;
  }

  fecharModalDel();
  showToast("Patógeno removido.", "success");
  await carregarDoencas();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, tipo) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + tipo;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}