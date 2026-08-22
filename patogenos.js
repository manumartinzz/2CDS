// patogenos.js
// Lê o catálogo de patógenos direto do banco (tabela "doencas").
// Precisa ser carregado DEPOIS de supabase-client.js.

const corTipo = {
  Fungo: "bg-purple-500/20 text-purple-300",
  Oomiceto: "bg-blue-500/20 text-blue-300",
  Bactéria: "bg-yellow-500/20 text-yellow-300",
  Vírus: "bg-red-500/20 text-red-300",
  Nematoide: "bg-orange-500/20 text-orange-300"
};

let patogenos = [];

document.addEventListener("DOMContentLoaded", async () => {
  lucide.createIcons();

  const { data, error } = await supabaseClient
    .from("doencas")
    .select("nome, tipo, grupo_risco, doenca_associada, orgao_afetado, nivel_bsl")
    .order("nome", { ascending: true });

  if (error) {
    document.getElementById("tabelaPatogenos").innerHTML =
      `<tr><td colspan="6" class="px-6 py-8 text-center text-red-400">Erro ao carregar: ${error.message}</td></tr>`;
    return;
  }

  // Mantém os mesmos nomes de campo que o restante do script já usava
  patogenos = (data || []).map((d) => ({
    nome: d.nome,
    tipo: d.tipo,
    risco: d.grupo_risco,
    doenca: d.doenca_associada,
    orgao: d.orgao_afetado,
    bsl: d.nivel_bsl
  }));

  renderPatogenos(patogenos);

  document.getElementById("searchPat").addEventListener("input", filtrar);
  document.getElementById("filterTipo").addEventListener("change", filtrar);
});

function renderPatogenos(lista) {
  const tbody = document.getElementById("tabelaPatogenos");
  const cont = document.getElementById("contagem");

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">Nenhum resultado encontrado.</td></tr>`;
    cont.textContent = "0 patógenos";
    return;
  }

  tbody.innerHTML = lista
    .map(
      (p) => `
        <tr class="border-t border-white/10 hover:bg-white/5 transition-colors">
            <td class="px-5 py-4 font-medium italic">${p.nome}</td>
            <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${corTipo[p.tipo] || "bg-white/10 text-white"}">
                    ${p.tipo || "—"}
                </span>
            </td>
            <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
                    GR${p.risco || "?"}
                </span>
            </td>
            <td class="px-5 py-4">${p.doenca || "—"}</td>
            <td class="px-5 py-4 text-slate-400">${p.orgao || "—"}</td>
            <td class="px-5 py-4 text-center font-mono font-bold text-cyan-400">${p.bsl || "—"}</td>
        </tr>
    `
    )
    .join("");

  cont.textContent = `${lista.length} patógeno${lista.length !== 1 ? "s" : ""} encontrado${lista.length !== 1 ? "s" : ""}`;
}

function filtrar() {
  const termo = document.getElementById("searchPat").value.toLowerCase();
  const tipo = document.getElementById("filterTipo").value;

  const resultado = patogenos.filter((p) => {
    const matchTipo = !tipo || p.tipo === tipo;
    const matchBusca =
      !termo ||
      (p.nome || "").toLowerCase().includes(termo) ||
      (p.doenca || "").toLowerCase().includes(termo) ||
      (p.tipo || "").toLowerCase().includes(termo) ||
      (p.orgao || "").toLowerCase().includes(termo);
    return matchTipo && matchBusca;
  });

  renderPatogenos(resultado);
}

function limparFiltros() {
  document.getElementById("searchPat").value = "";
  document.getElementById("filterTipo").value = "";
  renderPatogenos(patogenos);
}