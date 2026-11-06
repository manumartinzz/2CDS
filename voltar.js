/*
  voltar.js — AcquaSafe
  Botão "Voltar" no canto superior esquerdo, logo abaixo da logomarca,
  levando à página anterior realmente acessada.

  POSICIONAMENTO (corrigido nesta versão):
    antes era `left:16px; top:76px` fixo para TODAS as páginas. Em telas
    sem barra superior (login, cadastro, login-admin) isso fazia o botão
    flutuar sobre o conteúdo; em telas com barra sticky ele podia colar
    na borda do cabeçalho.

    Agora a posição é medida na própria página:
      • barra fixa/sticky no topo  -> botão fixed, logo abaixo da barra;
      • barra estática (catálogos) -> botão absolute, abaixo da barra,
        acompanhando a rolagem do documento;
      • sem barra (telas centradas) -> botão fixed no canto superior
        esquerdo (top:16px), sem sobrepor o cabeçalho.
    Em todos os casos o alinhamento horizontal acompanha a logo quando
    ela existe. Recalcula em resize e após os ícones carregarem.

  Não é carregado em index.html (pedido do usuário): a página de anúncio
  não tem botão Voltar. Não altera nenhum arquivo .css.
*/

(function () {
  function irParaPaginaAnterior() {
    try {
      const origem = document.referrer ? new URL(document.referrer).origin : "";
      if (origem && origem === location.origin && history.length > 1) {
        history.back();
        return;
      }
    } catch (_) { /* referrer inválido: cai no fallback */ }
    location.href = "index.html";
  }

  /* Caixa colorida da logomarca, antes ou depois do lucide.createIcons(). */
  function caixaDaLogo() {
    const icone = document.querySelector(
      '[data-lucide="droplets"], [data-lucide="shield"], ' +
      'svg.lucide-droplets, svg.lucide-shield, [class*="lucide-droplets"]'
    );
    return icone && icone.parentElement ? icone.parentElement : null;
  }

  function calcularPosicao() {
    const barra = document.querySelector("header, nav");
    const logo = caixaDaLogo();

    if (barra) {
      const r = barra.getBoundingClientRect();
      const noTopo = (r.top + window.scrollY) < 120;
      if (noTopo) {
        const estilo = getComputedStyle(barra).position;
        const fixa = estilo === "fixed" || estilo === "sticky";
        const lr = logo ? logo.getBoundingClientRect() : r;
        const left = Math.max(16, Math.round(lr.left + (fixa ? 0 : window.scrollX)));
        return {
          position: fixa ? "fixed" : "absolute",
          left: left,
          top: Math.round(fixa ? r.bottom + 12 : r.bottom + window.scrollY + 12)
        };
      }
    }

    // Sem barra no topo: canto superior esquerdo, sem sobrepor o cabeçalho.
    return { position: "fixed", left: 16, top: 16 };
  }

  function posicionar(btn) {
    const p = calcularPosicao();
    btn.style.position = p.position;
    btn.style.left = p.left + "px";
    btn.style.top = p.top + "px";
    btn.style.right = "auto";
    btn.style.bottom = "auto";
  }

  function criarBotao() {
    if (document.getElementById("btn-voltar")) return;

    const btn = document.createElement("button");
    btn.id = "btn-voltar";
    btn.type = "button";
    btn.setAttribute("aria-label", "Voltar para a página anterior");
    btn.innerHTML = '<span aria-hidden="true">←</span> Voltar';
    btn.className =
      "z-[60] inline-flex items-center gap-1.5 " +
      "text-xs font-semibold px-3 py-2 rounded-xl border border-cyan-400/30 " +
      "bg-slate-900/80 text-cyan-300 hover:bg-slate-800 backdrop-blur " +
      "transition shadow-lg";

    // sensor-local.html é autocontida e não carrega Tailwind via CDN.
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      btn.style.cssText =
        "z-index:60;display:inline-flex;align-items:center;gap:6px;" +
        "padding:8px 12px;border-radius:12px;border:1px solid rgba(34,211,238,.35);" +
        "background:rgba(15,23,42,.9);color:#67e8f9;font-size:12px;font-weight:600;cursor:pointer;";
    }

    posicionar(btn);
    btn.addEventListener("click", irParaPaginaAnterior);
    document.body.appendChild(btn);

    // Ícones, fontes e layout podem terminar depois do DOMContentLoaded.
    const atualizar = () => posicionar(btn);
    window.addEventListener("resize", atualizar);
    window.addEventListener("load", atualizar);
    [120, 400, 1000].forEach(ms => setTimeout(atualizar, ms));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", criarBotao);
  } else {
    criarBotao();
  }
})();
