/*
  perfil.js — AcquaSafe · Meu Perfil
  Mostra todos os dados do cadastro + financeiro (faturas pagas e a vencer).
  Precisa de: supabase-client.js, config-admins.js.
*/

const $ = (id) => document.getElementById(id);

function textoSeguro(v) { return String(v ?? "").trim(); }

function fmtData(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

function fmtMoeda(v) {
  const n = Number(v);
  return Number.isFinite(n) ? "R$ " + n.toFixed(2).replace(".", ",") : "—";
}

function competencia(d) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" })
    .format(d).replace(".", "");
}

function chaveMes(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function linhaVazia(tbody, colunas, mensagem) {
  tbody.innerHTML =
    `<tr><td colspan="${colunas}" class="px-4 py-6 text-center text-slate-500">${mensagem}</td></tr>`;
}

function aplicarIcone(usuario) {
  const btn = $("btn-perfil-icone");
  if (!btn) return;
  const admin = ehAdmin(usuario);
  btn.className = admin
    ? "w-10 h-10 rounded-full flex items-center justify-center border border-amber-400/40 bg-black text-amber-300"
    : "w-10 h-10 rounded-full flex items-center justify-center border border-white/20 bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 text-white";
  btn.innerHTML = admin
    ? '<i data-lucide="crown" class="w-5 h-5"></i>'
    : '<i data-lucide="user" class="w-5 h-5"></i>';
  btn.title = admin ? "Administrador" : "Meu perfil";
  if (window.lucide) lucide.createIcons();
}

function preencherDados(user, perfil, plano, assinatura) {
  const meta = user.user_metadata || {};
  $("perfil-nome").textContent = textoSeguro(perfil?.nome_completo || meta.nome_completo) || "—";
  $("perfil-email").textContent = textoSeguro(perfil?.email || user.email) || "—";
  $("perfil-cpf").textContent = textoSeguro(perfil?.cpf || meta.cpf) || "Não informado";
  $("perfil-telefone").textContent = textoSeguro(perfil?.telefone || meta.telefone) || "Não informado";
  $("perfil-lavoura").textContent =
    (textoSeguro(perfil?.tipo_lavoura || meta.tipo_lavoura) || "soja").replace(/^./, (c) => c.toUpperCase());
  $("perfil-plano").textContent = plano?.nome || "Nenhum plano";
  $("perfil-status").textContent = assinatura?.status || "Sem assinatura";
  $("perfil-desde").textContent = fmtData(perfil?.created_at || user.created_at);
  $("perfil-tipo-conta").textContent = ehAdmin(user) ? "Administrador" : "Cliente";
}

async function carregarFinanceiro(userId) {
  const pagas = $("tbody-pagas");
  const vencer = $("tbody-vencer");
  const aviso = $("financeiro-aviso");

  const { data: assinaturas, error: erroAss } = await supabaseClient
    .from("assinaturas").select("id, plano_id, status, data_inicio, created_at")
    .eq("user_id", userId).order("created_at", { ascending: false });
  const { data: pagamentos, error: erroPag } = await supabaseClient
    .from("pagamentos").select("id, valor, status, confirmado_em, created_at")
    .order("confirmado_em", { ascending: false });
  const { data: planos } = await supabaseClient.from("planos").select("id, nome, preco");

  if (erroAss || erroPag) {
    console.warn("Financeiro indisponível:", erroAss?.message || erroPag?.message);
    linhaVazia(pagas, 4, "Não foi possível carregar as faturas.");
    linhaVazia(vencer, 4, "Não foi possível carregar as faturas.");
    aviso.textContent = "Rode supabase/schema.sql no SQL Editor para habilitar o financeiro.";
    aviso.classList.remove("hidden");
    return;
  }

  const pagamentosDoUsuario = (pagamentos || []).filter((p) =>
    (assinaturas || []).some((a) => a.id === p.assinatura_id)
  );

  // --- Faturas pagas ---
  if (!pagamentosDoUsuario.length) {
    linhaVazia(pagas, 4, "Nenhuma fatura paga até o momento.");
  } else {
    pagas.innerHTML = pagamentosDoUsuario.map((p) => {
      const d = new Date(p.confirmado_em || p.created_at);
      return `<tr class="border-t border-white/10">
        <td class="px-4 py-3">${competencia(d)}</td>
        <td class="px-4 py-3 font-medium">${fmtMoeda(p.valor)}</td>
        <td class="px-4 py-3 text-slate-400">${fmtData(d)}</td>
        <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">Pago</span></td>
      </tr>`;
    }).join("");
  }

  // --- Próximas faturas ---
  const ativa = (assinaturas || []).find((a) => a.status === "ativa");
  if (!ativa) {
    linhaVazia(vencer, 4, "Sem assinatura ativa — nenhuma fatura a vencer.");
    return;
  }
  const plano = (planos || []).find((p) => p.id === ativa.plano_id);
  const valor = plano?.preco ?? 89;
  const inicio = new Date(ativa.data_inicio || ativa.created_at);
  const dia = Math.min(Math.max(inicio.getDate() || 1, 1), 28);
  const mesesPagos = new Set(pagamentosDoUsuario.map((p) =>
    chaveMes(new Date(p.confirmado_em || p.created_at))));

  const hoje = new Date();
  const linhas = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, dia, 12);
    if (mesesPagos.has(chaveMes(d))) continue;
    linhas.push(`<tr class="border-t border-white/10">
      <td class="px-4 py-3">${competencia(d)}</td>
      <td class="px-4 py-3 font-medium">${fmtMoeda(valor)}</td>
      <td class="px-4 py-3 text-slate-400">${fmtData(d)}</td>
      <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">A vencer</span></td>
    </tr>`);
  }
  vencer.innerHTML = linhas.length
    ? linhas.join("")
    : '<tr><td colspan="4" class="px-4 py-6 text-center text-slate-500">Todas as próximas faturas já estão quitadas.</td></tr>';
}

async function init() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) { location.href = "login.html"; return; }

  aplicarIcone(user);

  // Conta de teste: o pHmetro já está ligado direto ao gráfico no portal,
  // então não deve existir uma página extra de leitura para essa conta.
  if (typeof ehContaPhDireto === "function" && ehContaPhDireto(user.email)) {
    const link = $("link-testar-sensor");
    if (link) link.classList.add("hidden");
  }

  const { data: perfil, error: erroPerfil } = await supabaseClient
    .from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (erroPerfil) {
    const aviso = $("perfil-aviso");
    aviso.textContent = "Alguns dados vêm do cadastro. Rode supabase/schema.sql para completar o perfil.";
    aviso.classList.remove("hidden");
  }

  const { data: assinatura } = await supabaseClient
    .from("assinaturas").select("id, plano_id, status, data_inicio, created_at")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: plano } = assinatura?.plano_id
    ? await supabaseClient.from("planos").select("id, nome, preco").eq("id", assinatura.plano_id).maybeSingle()
    : { data: null };

  preencherDados(user, perfil, plano, assinatura);
  await carregarFinanceiro(user.id);
  if (window.lucide) lucide.createIcons();
}

function sairPerfil() {
  supabaseClient.auth.signOut().then(() => { location.href = "login.html"; });
}

document.addEventListener("DOMContentLoaded", init);
