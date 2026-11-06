/*
  lavoura.js — AcquaSafe
  Regra única do "tipo de lavoura" escolhido no cadastro.

  ANTES: só a soja tinha catálogo; as demais culturas ficavam vazias.
  AGORA: todas as culturas do cadastro têm catálogo pesquisado em
  pesquisa-culturas.js (patógenos, soluções químicas, níveis de
  periculosidade e fontes oficiais). Visitante sem sessão continua
  vendo a soja em modo demonstração.

  As funções catalogoDisponivel() e renderCatalogoVazio() ficam mantidas
  por compatibilidade com versões antigas das páginas, mas nenhum catálogo
  é mais esvaziado.
*/

const LAVOURA_COM_DADOS = "soja";
const LAVOURA_PADRAO = "soja";

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

    return String(tipo || LAVOURA_PADRAO).trim().toLowerCase();
  } catch (err) {
    console.warn("Não foi possível ler a lavoura do usuário:", err.message);
    return LAVOURA_PADRAO;
  }
}

/** Cultura normalizada para uso nos catálogos (nunca lança, nunca vazia). */
async function obterCulturaAtual() {
  const bruta = await obterLavouraDoUsuario();
  if (typeof normalizarCultura === "function") return normalizarCultura(bruta || LAVOURA_PADRAO);
  return String(bruta || LAVOURA_PADRAO).trim().toLowerCase();
}

/** Compatibilidade: hoje TODAS as culturas têm catálogo. */
async function catalogoDisponivel() {
  await obterLavouraDoUsuario();
  return true;
}

/** Compatibilidade: mantida, mas não é mais usada para esvaziar catálogos. */
function renderCatalogoVazio(tbodyId, colunas, contagemId) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    tbody.innerHTML =
      `<tr><td colspan="${colunas}" class="px-6 py-10 text-center text-slate-400">` +
      `Nenhum registro encontrado para esta busca.` +
      `</td></tr>`;
  }
  const contagem = document.getElementById(contagemId);
  if (contagem) contagem.textContent = "0 registros encontrados";
}
