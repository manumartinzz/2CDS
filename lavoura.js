/*
  lavoura.js — AcquaSafe
  Regra única do "tipo de lavoura" escolhido no cadastro.

  Hoje o banco só está completo para SOJA (doenças, periculosidade e
  soluções químicas). Para qualquer outra lavoura, os três catálogos
  ficam VAZIOS, com uma explicação em vez de dados da soja.

  Visitante sem sessão continua vendo o catálogo de soja (modo demonstração).
*/

const LAVOURA_COM_DADOS = "soja";

async function obterLavouraDoUsuario() {
  if (typeof supabaseClient === "undefined") return null;
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null; // sem login = demonstração pública

    let tipo = user.user_metadata?.tipo_lavoura;
    const { data: perfil } = await supabaseClient
      .from("profiles")
      .select("tipo_lavoura")
      .eq("id", user.id)
      .maybeSingle();
    if (perfil?.tipo_lavoura) tipo = perfil.tipo_lavoura;

    return String(tipo || LAVOURA_COM_DADOS).trim().toLowerCase();
  } catch (err) {
    console.warn("Não foi possível ler a lavoura do usuário:", err.message);
    return LAVOURA_COM_DADOS;
  }
}

/** true = pode exibir o catálogo; false = deixar as tabelas vazias. */
async function catalogoDisponivel() {
  const lavoura = await obterLavouraDoUsuario();
  return lavoura === null || lavoura === LAVOURA_COM_DADOS;
}

/** Renderiza o estado vazio de um catálogo, sem dados da soja. */
function renderCatalogoVazio(tbodyId, colunas, contagemId) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    tbody.innerHTML =
      `<tr><td colspan="${colunas}" class="px-6 py-10 text-center text-slate-400">` +
      `Ainda não há dados desta lavoura. O catálogo completo está disponível para soja.` +
      `</td></tr>`;
  }
  const contagem = document.getElementById(contagemId);
  if (contagem) contagem.textContent = "0 registros para esta lavoura";
}
