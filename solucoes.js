// Catálogo de soluções: usa Supabase e mantém fallback para não deixar a tela vazia.
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
function normalizar(s) { return {...s, uso: s.uso_principal || s.uso || "—", validade: s.validade_dias ?? s.validade ?? "—"}; }
function renderSolucoes(lista) {
  document.getElementById("tabelaSolucoes").innerHTML = lista.map(s => `<tr class="border-t border-white/10 hover:bg-white/5"><td class="px-6 py-4 font-medium">${s.nome}</td><td class="px-6 py-4">${s.concentracao || "—"}</td><td class="px-6 py-4">${s.solvente || "—"}</td><td class="px-6 py-4">${s.uso}</td><td class="px-6 py-4">${s.validade}</td><td class="px-6 py-4 text-center text-xs text-slate-500">Catálogo</td></tr>`).join("");
}
function filtrarSolucoes() { const t=document.getElementById("search").value.toLowerCase(); renderSolucoes(t ? solucoes.filter(s=>Object.values(s).some(v=>String(v).toLowerCase().includes(t))) : solucoes); }
function limparFiltros() { document.getElementById("search").value=""; renderSolucoes(solucoes); }
document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();
  const {data,error}=await supabaseClient.from("solucoes").select("nome, concentracao, solvente, uso, uso_principal, validade_dias, observacoes").order("nome");
  solucoes=(error || !data || !data.length ? fallbackSolucoes : data).map(normalizar);
  renderSolucoes(solucoes);
  document.getElementById("search").addEventListener("input", filtrarSolucoes);
});
