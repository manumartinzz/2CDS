// Catálogo de doenças e patógenos — pesquisa por cultura + fontes oficiais.
// O banco Supabase (tabela doencas) continua sendo consultado e serve de
// enriquecimento; o catálogo pesquisado em pesquisa-culturas.js é a base.
const corTipo = {
  Fungo: "bg-purple-500/20 text-purple-300", Oomiceto: "bg-blue-500/20 text-blue-300",
  Bactéria: "bg-yellow-500/20 text-yellow-300", Vírus: "bg-red-500/20 text-red-300",
  Nematoide: "bg-orange-500/20 text-orange-300", Protozoário: "bg-cyan-500/20 text-cyan-300",
  Helminto: "bg-amber-500/20 text-amber-300", "Inseto vetor": "bg-rose-500/20 text-rose-300",
  Referência: "bg-white/10 text-slate-300"
};

const corImpacto = {
  "Altíssimo": "bg-red-500/20 text-red-300",
  "Alto": "bg-orange-500/20 text-orange-300",
  "Moderado": "bg-yellow-500/20 text-yellow-300",
  "Baixo": "bg-emerald-500/20 text-emerald-300",
  "Água": "bg-cyan-500/20 text-cyan-300"
};

/* Nomes legados de veiculação hídrica presentes na tabela doencas. */
const NOMES_AGUA_LEGADO = new Set([
  "vibrio cholerae", "leptospira interrogans", "giardia duodenalis",
  "cryptosporidium parvum", "hepatitis a virus (hav)",
  "salmonella enterica serovar typhi", "shigella sonnei", "schistosoma mansoni",
  "escherichia coli", "coliformes termotolerantes"
]);

let patogenos = [];

function _norm(nome) { return String(nome || "").trim().toLowerCase(); }

function mesclarSemDuplicar(base, extras) {
  const vistos = new Set(base.map(p => _norm(p.nome)));
  (extras || []).forEach(p => {
    const k = _norm(p.nome);
    if (k && !vistos.has(k)) { vistos.add(k); base.push(p); }
  });
  return base;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  const cultura = typeof obterCulturaAtual === "function" ? await obterCulturaAtual() : "soja";
  window.ACQUASAFE_CULTURA = cultura;

  // Base pesquisada: patógenos da cultura + patógenos de veiculação hídrica.
  let lista = typeof patogenosDaCultura === "function"
    ? patogenosDaCultura(cultura).map(p => ({ ...p }))
    : [];

  // Enriquecimento com o banco (preserva a integração Supabase anterior).
  try {
    const { data, error } = await supabaseClient.from("doencas")
      .select("nome, tipo, grupo_risco, doenca_associada, orgao_afetado, nivel_bsl")
      .order("nome", { ascending: true });
    if (!error && data && data.length) {
      const doBanco = data
        .filter(d => cultura === "soja" || NOMES_AGUA_LEGADO.has(_norm(d.nome)))
        .map(d => ({
          nome: d.nome, tipo: d.tipo, impacto: "Água",
          doenca: d.doenca_associada, orgao: d.orgao_afetado,
          saude: d.nivel_bsl && String(d.nivel_bsl).startsWith("BSL-2") ? "Classe 2 (MS)" : "Não aplicável",
          controle: "Ver catálogo de soluções e fontes ao final da página"
        }));
      lista = mesclarSemDuplicar(lista, doBanco);
    }
  } catch (err) {
    console.warn("Catálogo pesquisado exibido sem enriquecimento do banco:", err.message);
  }

  patogenos = lista;
  renderPatogenos(patogenos);
  document.getElementById("searchPat").addEventListener("input", filtrar);
  document.getElementById("filterTipo").addEventListener("change", filtrar);
  if (typeof renderFontesCultura === "function") renderFontesCultura(cultura, "#bloco-fontes");
});

function renderPatogenos(lista) {
  const tbody = document.getElementById("tabelaPatogenos");
  const cont = document.getElementById("contagem");
  const cultura = window.ACQUASAFE_CULTURA || "soja";
  const nomeCultura = typeof obterPesquisaCultura === "function"
    ? obterPesquisaCultura(cultura).nome : "Soja";
  tbody.innerHTML = lista.length ? lista.map(p => `
    <tr class="border-t border-white/10 hover:bg-white/5 transition-colors align-top">
      <td class="px-5 py-4 font-medium italic">${p.nome || "—"}</td>
      <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${corTipo[p.tipo] || "bg-white/10 text-white"}">${p.tipo || "—"}</span></td>
      <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-bold ${corImpacto[p.impacto] || "bg-white/10 text-slate-300"}">${p.impacto || "—"}</span></td>
      <td class="px-5 py-4">${p.doenca || "—"}</td>
      <td class="px-5 py-4 text-slate-400">${p.orgao || "—"}</td>
      <td class="px-5 py-4 text-center text-xs font-semibold ${p.saude === "Não aplicável" ? "text-slate-500" : "text-amber-300"}">${p.saude || "—"}</td>
      <td class="px-5 py-4 text-xs text-slate-400 max-w-xs">${p.controle || "—"}</td>
    </tr>`).join("") : `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-500">Nenhum resultado encontrado.</td></tr>`;
  cont.textContent = `${lista.length} patógeno${lista.length !== 1 ? "s" : ""} · ${nomeCultura} + água de irrigação`;
}
function filtrar() {
  const termo = document.getElementById("searchPat").value.toLowerCase();
  const tipo = document.getElementById("filterTipo").value;
  renderPatogenos(patogenos.filter(p => (!tipo || p.tipo === tipo) && (!termo || [p.nome,p.doenca,p.tipo,p.orgao,p.controle].some(v => (v||"").toLowerCase().includes(termo)))));
}
function limparFiltros() { document.getElementById("searchPat").value = ""; document.getElementById("filterTipo").value = ""; renderPatogenos(patogenos); }
