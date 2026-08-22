// admin-doencas.js
// Substitui inteiramente a lógica antiga (localStorage).
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
  document.getElementById("filtro-cat").addEventListener("change", renderLista);
}

async function carregarDoencas() {
  const { data, error } = await supabaseClient
    .from("doencas")
    .select("id, nome, categoria, descricao")
    .order("nome", { ascending: true });

  if (error) {
    showToast("Erro ao carregar doenças: " + error.message, "error");
    return;
  }

  doencas = data || [];
  atualizarCategorias();
  renderLista();
}

// ── Categorias dinâmicas ──────────────────────────────────────────────────────
function atualizarCategorias() {
  const sel = document.getElementById("filtro-cat");
  const atual = sel.value;
  const cats = [...new Set(doencas.map((d) => d.categoria).filter(Boolean))].sort();
  sel.innerHTML =
    '<option value="">Todas as categorias</option>' +
    cats.map((c) => `<option value="${c}" ${c === atual ? "selected" : ""}>${c}</option>`).join("");
}

// ── Renderização ──────────────────────────────────────────────────────────────
function renderLista() {
  const busca = document.getElementById("busca").value.toLowerCase();
  const filtro = document.getElementById("filtro-cat").value;

  const filtrados = doencas.filter((d) => {
    const match =
      d.nome.toLowerCase().includes(busca) ||
      (d.categoria || "").toLowerCase().includes(busca) ||
      (d.descricao || "").toLowerCase().includes(busca);
    const catOk = !filtro || d.categoria === filtro;
    return match && catOk;
  });

  const lista = document.getElementById("lista-doencas");
  const empty = document.getElementById("empty-state");
  const cont = document.getElementById("contador");

  cont.textContent = `${filtrados.length} de ${doencas.length} doença(s)`;

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
                    <span class="font-semibold text-sm">${d.nome}</span>
                    ${d.categoria ? `<span class="badge-cat">${d.categoria}</span>` : ""}
                </div>
                ${d.descricao ? `<p class="text-white/50 text-xs mt-1 leading-relaxed">${d.descricao}</p>` : ""}
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
  document.getElementById("modal-titulo").textContent = "Nova Doença";
  document.getElementById("f-nome").value = "";
  document.getElementById("f-cat").value = "";
  document.getElementById("f-desc").value = "";
  document.getElementById("modal").classList.add("open");
  setTimeout(() => document.getElementById("f-nome").focus(), 100);
  lucide.createIcons();
}

function abrirModalEditar(id) {
  const d = doencas.find((x) => x.id === id);
  if (!d) return;
  editandoId = id;
  document.getElementById("modal-titulo").textContent = "Editar Doença";
  document.getElementById("f-nome").value = d.nome;
  document.getElementById("f-cat").value = d.categoria || "";
  document.getElementById("f-desc").value = d.descricao || "";
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
  const cat = document.getElementById("f-cat").value.trim();
  const desc = document.getElementById("f-desc").value.trim();

  if (!nome) {
    showToast("Informe o nome da doença.", "error");
    document.getElementById("f-nome").focus();
    return;
  }

  if (editandoId) {
    const { error } = await supabaseClient
      .from("doencas")
      .update({ nome, categoria: cat, descricao: desc })
      .eq("id", editandoId);

    if (error) {
      showToast("Erro ao atualizar: " + error.message, "error");
      return;
    }
    showToast("Doença atualizada com sucesso!", "success");
  } else {
    const { error } = await supabaseClient
      .from("doencas")
      .insert({ nome, categoria: cat, descricao: desc });

    if (error) {
      showToast("Erro ao adicionar: " + error.message, "error");
      return;
    }
    showToast("Doença adicionada com sucesso!", "success");
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
  showToast("Doença removida.", "success");
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