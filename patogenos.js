// Catálogo de doenças — SOMENTE patógenos que contaminam a lavoura pela ÁGUA.
// Fonte única dos dados: pesquisa-culturas.js (pesquisa por cultura + fontes
// oficiais). As tabelas do Supabase (doencas/solucoes) NÃO são mais lidas
// aqui: elas contêm doenças de dispersão aérea, por vetores e por mudas,
// que não atendem ao critério de via hídrica.
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

let patogenos = [];

function _esc(t) {
  return String(t == null ? "" : t)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  const cultura = typeof obterCulturaAtual === "function" ? await obterCulturaAtual() : "soja";
  window.ACQUASAFE_CULTURA = cultura;

  // Catálogo pesquisado: doenças da cultura transmitidas pela água +
  // agentes universais de veiculação hídrica.
  patogenos = typeof patogenosDaCultura === "function"
    ? patogenosDaCultura(cultura).map(p => ({ ...p }))
    : [];

  // Trava de integridade: se alguma doença sem via hídrica entrar aqui,
  // o catálogo avisa em vez de exibir dados incorretos em silêncio.
  if (typeof validarCatalogo === "function") {
    const erros = validarCatalogo();
    if (erros.length) console.warn("Catálogo inconsistente:", erros);
  }

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
      <td class="px-5 py-4 font-medium italic">${_esc(p.nome)}</td>
      <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${corTipo[p.tipo] || "bg-white/10 text-white"}">${_esc(p.tipo)}</span></td>
      <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-bold ${corImpacto[p.impacto] || "bg-white/10 text-slate-300"}">${_esc(p.impacto)}</span></td>
      <td class="px-5 py-4 font-medium">${_esc(p.doenca)}</td>
      <td class="px-5 py-4 text-xs text-cyan-300/90 max-w-xs">
        ${_esc(p.via)}<br>
        <a href="${_esc(p.url)}" target="_blank" rel="noopener noreferrer"
           class="text-[11px] text-slate-400 hover:text-cyan-300 underline">${_esc(p.fonte)} ↗</a>
      </td>
      <td class="px-5 py-4 text-slate-400">${_esc(p.orgao)}</td>
      <td class="px-5 py-4 text-center text-xs font-semibold ${p.saude === "Não aplicável" ? "text-slate-500" : "text-amber-300"}">${_esc(p.saude)}</td>
      <td class="px-5 py-4 text-xs text-slate-400 max-w-xs">${_esc(p.controle)}</td>
    </tr>`).join("") : `<tr><td colspan="8" class="px-6 py-8 text-center text-slate-500">Nenhum resultado encontrado.</td></tr>`;
  cont.textContent = `${lista.length} doença${lista.length !== 1 ? "s" : ""} transmitida${lista.length !== 1 ? "s" : ""} pela água · ${nomeCultura}`;
}
function filtrar() {
  const termo = document.getElementById("searchPat").value.toLowerCase();
  const tipo = document.getElementById("filterTipo").value;
  renderPatogenos(patogenos.filter(p => (!tipo || p.tipo === tipo) && (!termo || [p.nome,p.doenca,p.tipo,p.orgao,p.controle,p.via].some(v => (v||"").toLowerCase().includes(termo)))));
}
function limparFiltros() { document.getElementById("searchPat").value = ""; document.getElementById("filterTipo").value = ""; renderPatogenos(patogenos); }
