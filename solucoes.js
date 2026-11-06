// Catálogo de soluções químicas — pesquisa por cultura + fontes oficiais.
// Mantém o bloco universal de tratamento/calibração de água (opção A) e
// acrescenta as soluções de controle registradas para a cultura da conta.
const fallbackSolucoes = [
  {nome:"Hipoclorito de Sódio", concentracao:"10–15%", solvente:"Água", uso:"Desinfecção", validade:180},
  {nome:"Sulfato de Cobre", concentracao:"0,1%", solvente:"Água", uso:"Algicida", validade:365},
  {nome:"Ácido Peracético", concentracao:"5%", solvente:"Água", uso:"Esterilização", validade:90},
  {nome:"Cloreto de Cálcio", concentracao:"2%", solvente:"Água", uso:"Tratamento", validade:240},
  {nome:"Dióxido de Cloro", concentracao:"0,2–1,0 mg/L", solvente:"Água", uso:"Desinfecção de água", validade:30},
  {nome:"Peróxido de Hidrogênio", concentracao:"3–10%", solvente:"Água", uso:"Oxidação e desinfecção", validade:180},
  {nome:"Carvão Ativado Granular", concentracao:"Leito filtrante", solvente:"Água", uso:"Remoção de odor e compostos orgânicos", validade:365},
  {nome:"Solução tampão pH 7,00", concentracao:"Pronta para uso", solvente:"Água deionizada", uso:"Calibração de medidores de pH", validade:180},
  {nome:"Solução padrão de turbidez", concentracao:"20 NTU", solvente:"Suspensão padrão", uso:"Calibração de turbidímetro", validade:180}
];
let solucoes = [];

function normalizar(s) {
  return {
    ...s,
    nome: s.nome || "—",
    concentracao: s.concentracao || "—",
    solvente: s.solvente || "—",
    uso: s.uso_principal || s.uso || "—",
    validade: s.validade_dias ?? s.validade ?? "—",
    ghs: s.ghs || "Específica por produto",
    alvo: s.alvo || "Água"
  };
}

function _norm(nome) { return String(nome || "").trim().toLowerCase(); }

function renderSolucoes(lista) {
  const corpo = document.getElementById("tabelaSolucoes");
  if (!corpo) return;
  corpo.innerHTML = lista.length ? lista.map(s => `
    <tr class="border-t border-white/10 hover:bg-white/5 align-top">
      <td class="px-6 py-4 font-medium">${s.nome}</td>
      <td class="px-6 py-4">${s.concentracao}</td>
      <td class="px-6 py-4">${s.solvente}</td>
      <td class="px-6 py-4">${s.uso}</td>
      <td class="px-6 py-4">${s.validade}</td>
      <td class="px-6 py-4 text-xs text-amber-300/90">${s.ghs}</td>
      <td class="px-6 py-4 text-xs text-slate-400">${s.alvo}</td>
    </tr>`).join("")
    : `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-500">Nenhum resultado encontrado.</td></tr>`;
  const cont = document.getElementById("contagem-solucoes");
  if (cont) {
    const cultura = typeof obterPesquisaCultura === "function"
      ? obterPesquisaCultura(window.ACQUASAFE_CULTURA || "soja").nome : "Soja";
    cont.textContent = `${lista.length} soluções · ${cultura} + água`;
  }
}
function filtrarSolucoes() { const t=document.getElementById("search").value.toLowerCase(); renderSolucoes(t ? solucoes.filter(s=>Object.values(s).some(v=>String(v).toLowerCase().includes(t))) : solucoes); }
function limparFiltros() { document.getElementById("search").value=""; renderSolucoes(solucoes); }

document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  const cultura = typeof obterCulturaAtual === "function" ? await obterCulturaAtual() : "soja";
  window.ACQUASAFE_CULTURA = cultura;

  // Base pesquisada: soluções da cultura + bloco universal de água.
  let lista = (typeof solucoesDaCultura === "function"
    ? solucoesDaCultura(cultura) : fallbackSolucoes).map(s => ({ ...s }));

  // Enriquecimento com o banco (preserva a integração Supabase anterior).
  try {
    const {data,error}=await supabaseClient.from("solucoes")
      .select("nome, concentracao, solvente, uso, uso_principal, validade_dias, observacoes").order("nome");
    if (!error && data && data.length) {
      const vistos = new Set(lista.map(s => _norm(s.nome)));
      data.forEach(s => {
        const k = _norm(s.nome);
        if (k && !vistos.has(k)) {
          vistos.add(k);
          lista.push({ ...s, ghs: "Específica por produto", alvo: "Água (cadastro)" });
        }
      });
    }
  } catch (err) {
    console.warn("Catálogo pesquisado exibido sem enriquecimento do banco:", err.message);
  }

  solucoes = lista.map(normalizar);
  renderSolucoes(solucoes);
  document.getElementById("search").addEventListener("input", filtrarSolucoes);
  if (typeof renderFontesCultura === "function") renderFontesCultura(cultura, "#bloco-fontes");
});
