// Catálogo de doenças e patógenos: Supabase primeiro, fallback local preservando o catálogo anterior.
const corTipo = {
  Fungo: "bg-purple-500/20 text-purple-300", Oomiceto: "bg-blue-500/20 text-blue-300",
  Bactéria: "bg-yellow-500/20 text-yellow-300", Vírus: "bg-red-500/20 text-red-300",
  Nematoide: "bg-orange-500/20 text-orange-300", Protozoário: "bg-cyan-500/20 text-cyan-300",
  Helminto: "bg-amber-500/20 text-amber-300"
};
const catalogoFallback = [
  {
    "nome": "Phakopsora pachyrhizi",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Ferrugem asiática da soja",
    "orgao_afetado": "Folhas / vagens",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Phakopsora meibomiae",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Ferrugem americana da soja",
    "orgao_afetado": "Folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Sclerotinia sclerotiorum",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Mofo-branco / podridão branca da haste",
    "orgao_afetado": "Hastes / vagens",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Colletotrichum truncatum",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Antracnose",
    "orgao_afetado": "Vagens / hastes / folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Rhizoctonia solani AG1",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Mela / requeima / tombamento",
    "orgao_afetado": "Folhas / colo / raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Macrophomina phaseolina",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Podridão de carvão da raiz",
    "orgao_afetado": "Raízes / colo",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Cercospora kikuchii",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Crestamento foliar de Cercospora / mancha púrpura",
    "orgao_afetado": "Folhas / sementes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Cercospora sojina",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Mancha olho-de-rã",
    "orgao_afetado": "Folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Septoria glycines",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Mancha parda / septoriose",
    "orgao_afetado": "Folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Diaporthe aspalathi",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Cancro da haste",
    "orgao_afetado": "Hastes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Diaporthe caulivora",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Cancro da haste",
    "orgao_afetado": "Hastes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Phomopsis longicolla",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Seca da haste e da vagem",
    "orgao_afetado": "Hastes / vagens / sementes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Corynespora cassiicola",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Mancha alvo / podridão radicular de Corynespora",
    "orgao_afetado": "Folhas / raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Microsphaera diffusa",
    "tipo": "Fungo",
    "grupo_risco": "1",
    "doenca_associada": "Oídio da soja",
    "orgao_afetado": "Folhas / hastes",
    "nivel_bsl": "BSL-1"
  },
  {
    "nome": "Sclerotium rolfsii",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Tombamento e murcha de Sclerotium",
    "orgao_afetado": "Colo / raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Cadophora gregata",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Podridão parda da haste",
    "orgao_afetado": "Hastes / raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Fusarium virguliforme",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Síndrome da morte súbita (SMS)",
    "orgao_afetado": "Raízes / hastes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Fusarium solani f. sp. glycines",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Podridão radicular de Fusarium",
    "orgao_afetado": "Raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Fusarium semitectum",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Podridão de sementes / tombamento",
    "orgao_afetado": "Sementes / plântulas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Rosellinia necatrix",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Podridão radicular de Rosellinia",
    "orgao_afetado": "Raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Calonectria ilicicola",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Podridão vermelha da coroa",
    "orgao_afetado": "Raízes / colo",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Ascochyta sojae",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Mancha foliar de Ascochyta",
    "orgao_afetado": "Folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Myrothecium roridum",
    "tipo": "Fungo",
    "grupo_risco": "2",
    "doenca_associada": "Mancha foliar de Myrothecium",
    "orgao_afetado": "Folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Alternaria alternata",
    "tipo": "Fungo",
    "grupo_risco": "1",
    "doenca_associada": "Mancha de Alternaria / deterioração",
    "orgao_afetado": "Sementes / folhas",
    "nivel_bsl": "BSL-1"
  },
  {
    "nome": "Phytophthora sojae",
    "tipo": "Oomiceto",
    "grupo_risco": "2",
    "doenca_associada": "Podridão radicular e da haste de Phytophthora",
    "orgao_afetado": "Raízes / hastes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Peronospora manshurica",
    "tipo": "Oomiceto",
    "grupo_risco": "2",
    "doenca_associada": "Míldio da soja",
    "orgao_afetado": "Folhas / sementes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Pythium spp.",
    "tipo": "Oomiceto",
    "grupo_risco": "2",
    "doenca_associada": "Tombamento de plântulas / podridão radicular",
    "orgao_afetado": "Raízes / plântulas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Pseudomonas savastanoi pv. glycinea",
    "tipo": "Bactéria",
    "grupo_risco": "2",
    "doenca_associada": "Crestamento bacteriano",
    "orgao_afetado": "Folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Pseudomonas syringae pv. tabaci",
    "tipo": "Bactéria",
    "grupo_risco": "2",
    "doenca_associada": "Fogo selvagem",
    "orgao_afetado": "Folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Xanthomonas axonopodis pv. glycines",
    "tipo": "Bactéria",
    "grupo_risco": "2",
    "doenca_associada": "Pústula bacteriana",
    "orgao_afetado": "Folhas / vagens",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Curtobacterium flaccumfaciens pv. flaccumfaciens",
    "tipo": "Bactéria",
    "grupo_risco": "2",
    "doenca_associada": "Murcha bacteriana / mancha bacteriana marrom",
    "orgao_afetado": "Sistema vascular",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Soybean Mosaic Virus (SMV)",
    "tipo": "Vírus",
    "grupo_risco": "2",
    "doenca_associada": "Mosaico comum da soja",
    "orgao_afetado": "Folhas / plantas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Bean Pod Mottle Virus (BPMV)",
    "tipo": "Vírus",
    "grupo_risco": "2",
    "doenca_associada": "Mosqueado do feijão / soja",
    "orgao_afetado": "Folhas / vagens",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Alfalfa Mosaic Virus (AMV)",
    "tipo": "Vírus",
    "grupo_risco": "2",
    "doenca_associada": "Mosaico cálico",
    "orgao_afetado": "Folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Cowpea Mild Mottle Virus (CPMMV)",
    "tipo": "Vírus",
    "grupo_risco": "2",
    "doenca_associada": "Necrose da haste",
    "orgao_afetado": "Hastes / folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Tobacco Streak Virus (TSV)",
    "tipo": "Vírus",
    "grupo_risco": "2",
    "doenca_associada": "Queima do broto",
    "orgao_afetado": "Brotos / folhas",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Heterodera glycines",
    "tipo": "Nematoide",
    "grupo_risco": "3",
    "doenca_associada": "Nematoide de cisto da soja (NCS)",
    "orgao_afetado": "Raízes",
    "nivel_bsl": "BSL-3"
  },
  {
    "nome": "Meloidogyne incognita",
    "tipo": "Nematoide",
    "grupo_risco": "2",
    "doenca_associada": "Nematoide de galhas",
    "orgao_afetado": "Raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Meloidogyne javanica",
    "tipo": "Nematoide",
    "grupo_risco": "2",
    "doenca_associada": "Nematoide de galhas",
    "orgao_afetado": "Raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Pratylenchus brachyurus",
    "tipo": "Nematoide",
    "grupo_risco": "2",
    "doenca_associada": "Nematoide das lesões radiculares",
    "orgao_afetado": "Raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Rotylenchulus reniformis",
    "tipo": "Nematoide",
    "grupo_risco": "2",
    "doenca_associada": "Nematoide reniforme",
    "orgao_afetado": "Raízes",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Vibrio cholerae",
    "tipo": "Bactéria",
    "grupo_risco": "2",
    "doenca_associada": "Cólera",
    "orgao_afetado": "Intestino delgado",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Leptospira interrogans",
    "tipo": "Bactéria",
    "grupo_risco": "2",
    "doenca_associada": "Leptospirose",
    "orgao_afetado": "Rins / fígado / pulmões",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Giardia duodenalis",
    "tipo": "Protozoário",
    "grupo_risco": "2",
    "doenca_associada": "Giardíase",
    "orgao_afetado": "Intestino delgado",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Cryptosporidium parvum",
    "tipo": "Protozoário",
    "grupo_risco": "2",
    "doenca_associada": "Criptosporidiose",
    "orgao_afetado": "Intestino",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Hepatitis A virus (HAV)",
    "tipo": "Vírus",
    "grupo_risco": "2",
    "doenca_associada": "Hepatite A",
    "orgao_afetado": "Fígado",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Salmonella enterica serovar Typhi",
    "tipo": "Bactéria",
    "grupo_risco": "2",
    "doenca_associada": "Febre tifoide",
    "orgao_afetado": "Intestino / sistema reticuloendotelial",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Shigella sonnei",
    "tipo": "Bactéria",
    "grupo_risco": "2",
    "doenca_associada": "Shigelose / disenteria bacilar",
    "orgao_afetado": "Cólon",
    "nivel_bsl": "BSL-2"
  },
  {
    "nome": "Schistosoma mansoni",
    "tipo": "Helminto",
    "grupo_risco": "2",
    "doenca_associada": "Esquistossomose",
    "orgao_afetado": "Intestino / fígado",
    "nivel_bsl": "BSL-2"
  }
];
let patogenos = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();
  const { data, error } = await supabaseClient.from("doencas")
    .select("nome, tipo, grupo_risco, doenca_associada, orgao_afetado, nivel_bsl")
    .order("nome", { ascending: true });
  if (error || !data || data.length === 0) {
    patogenos = catalogoFallback.map(d => ({
      nome: d.nome,
      tipo: d.tipo,
      risco: d.grupo_risco,
      doenca: d.doenca_associada,
      orgao: d.orgao_afetado,
      bsl: d.nivel_bsl
    }));
    const aviso = document.getElementById("contagem");
    if (error) aviso.textContent = "Catálogo local exibido enquanto o banco é configurado.";
  } else {
    patogenos = data.map(d => ({ nome:d.nome, tipo:d.tipo, risco:d.grupo_risco, doenca:d.doenca_associada, orgao:d.orgao_afetado, bsl:d.nivel_bsl }));
  }
  renderPatogenos(patogenos);
  document.getElementById("searchPat").addEventListener("input", filtrar);
  document.getElementById("filterTipo").addEventListener("change", filtrar);
});

function renderPatogenos(lista) {
  const tbody = document.getElementById("tabelaPatogenos");
  const cont = document.getElementById("contagem");
  tbody.innerHTML = lista.length ? lista.map(p => `
    <tr class="border-t border-white/10 hover:bg-white/5 transition-colors">
      <td class="px-5 py-4 font-medium italic">${p.nome}</td>
      <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${corTipo[p.tipo] || "bg-white/10 text-white"}">${p.tipo || "—"}</span></td>
      <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">GR${p.risco || "?"}</span></td>
      <td class="px-5 py-4">${p.doenca || "—"}</td>
      <td class="px-5 py-4 text-slate-400">${p.orgao || "—"}</td>
      <td class="px-5 py-4 text-center font-mono font-bold text-cyan-400">${p.bsl || "—"}</td>
    </tr>`).join("") : `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">Nenhum resultado encontrado.</td></tr>`;
  cont.textContent = `${lista.length} patógeno${lista.length !== 1 ? "s" : ""} encontrado${lista.length !== 1 ? "s" : ""}`;
}
function filtrar() {
  const termo = document.getElementById("searchPat").value.toLowerCase();
  const tipo = document.getElementById("filterTipo").value;
  renderPatogenos(patogenos.filter(p => (!tipo || p.tipo === tipo) && (!termo || [p.nome,p.doenca,p.tipo,p.orgao].some(v => (v||"").toLowerCase().includes(termo)))));
}
function limparFiltros() { document.getElementById("searchPat").value = ""; document.getElementById("filterTipo").value = ""; renderPatogenos(patogenos); }
