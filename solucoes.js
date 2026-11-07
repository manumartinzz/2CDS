// Catálogo de soluções — UMA solução para CADA doença, com o nome da doença.
// Os dados vêm exclusivamente de pesquisa-culturas.js: cada solução é gerada
// a partir de uma doença de via hídrica e o validador garante a regra 1:1.
// As tabelas do Supabase não são consultadas aqui (ver patogenos.js).
let solucoes = [];

function _esc(t) {
  return String(t == null ? "" : t)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function renderSolucoes(lista) {
  const corpo = document.getElementById("tabelaSolucoes");
  if (!corpo) return;
  corpo.innerHTML = lista.length ? lista.map(s => `
    <tr class="border-t border-white/10 hover:bg-white/5 align-top">
      <td class="px-5 py-4 font-medium text-white max-w-xs">${_esc(s.nome)}</td>
      <td class="px-5 py-4 text-cyan-300/90">${_esc(s.doenca)}</td>
      <td class="px-5 py-4 italic text-slate-400">${_esc(s.patogeno)}</td>
      <td class="px-5 py-4 text-xs text-slate-400 max-w-xs">${_esc(s.via)}</td>
      <td class="px-5 py-4 text-xs text-slate-300 max-w-xs">${_esc(s.uso)}<br><span class="text-[11px] text-slate-500">${_esc(s.concentracao)}</span></td>
      <td class="px-5 py-4 text-xs text-amber-300/90">${_esc(s.ghs)}</td>
      <td class="px-5 py-4 text-xs text-slate-400 max-w-xs">${_esc(s.alvo)}<br>
        <a href="${_esc(s.url)}" target="_blank" rel="noopener noreferrer"
           class="text-[11px] text-cyan-400/80 hover:text-cyan-300 underline">${_esc(s.fonte)} ↗</a>
      </td>
    </tr>`).join("")
    : `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-500">Nenhum resultado encontrado.</td></tr>`;

  const cont = document.getElementById("contagem-solucoes");
  if (cont) {
    const cultura = typeof obterPesquisaCultura === "function"
      ? obterPesquisaCultura(window.ACQUASAFE_CULTURA || "soja").nome : "Soja";
    const erros = typeof validarCatalogo === "function" ? validarCatalogo() : [];
    cont.textContent = `${lista.length} soluções · 1 para cada uma das ${lista.length} doenças transmitidas pela água · ${cultura}` +
      (erros.length ? " · ATENÇÃO: catálogo inconsistente" : "");
  }
}

function filtrarSolucoes() {
  const t = document.getElementById("search").value.toLowerCase();
  renderSolucoes(t ? solucoes.filter(s => Object.values(s).some(v => String(v).toLowerCase().includes(t))) : solucoes);
}
function limparFiltros() { document.getElementById("search").value = ""; renderSolucoes(solucoes); }

document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  const cultura = typeof obterCulturaAtual === "function" ? await obterCulturaAtual() : "soja";
  window.ACQUASAFE_CULTURA = cultura;

  solucoes = typeof solucoesDaCultura === "function"
    ? solucoesDaCultura(cultura).map(s => ({ ...s }))
    : [];

  if (typeof validarCatalogo === "function") {
    const erros = validarCatalogo();
    if (erros.length) console.warn("Catálogo 1:1 inconsistente:", erros);
  }

  renderSolucoes(solucoes);
  document.getElementById("search").addEventListener("input", filtrarSolucoes);
  if (typeof renderFontesCultura === "function") renderFontesCultura(cultura, "#bloco-fontes");
});
