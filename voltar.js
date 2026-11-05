/*
  voltar.js — AcquaSafe
  Botão "Voltar" presente em TODAS as páginas, no canto superior esquerdo,
  logo abaixo da logomarca. Leva à página anterior realmente acessada.

  Carregado no fim de cada HTML (antes do </body>). Não altera nenhum CSS:
  usa as classes utilitárias que o site já carrega (Tailwind) e, em páginas
  sem Tailwind (sensor-local.html), aplica um estilo inline equivalente.
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

  function criarBotao() {
    if (document.getElementById("btn-voltar")) return;

    const btn = document.createElement("button");
    btn.id = "btn-voltar";
    btn.type = "button";
    btn.setAttribute("aria-label", "Voltar para a página anterior");
    btn.innerHTML = '<span aria-hidden="true">←</span> Voltar';
    btn.className =
      "fixed left-4 top-[76px] z-[60] inline-flex items-center gap-1.5 " +
      "text-xs font-semibold px-3 py-2 rounded-xl border border-cyan-400/30 " +
      "bg-slate-900/80 text-cyan-300 hover:bg-slate-800 backdrop-blur " +
      "transition shadow-lg";

    // sensor-local.html é autocontida e não carrega Tailwind via CDN.
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      btn.style.cssText =
        "position:fixed;left:16px;top:76px;z-index:60;display:inline-flex;" +
        "align-items:center;gap:6px;padding:8px 12px;border-radius:12px;" +
        "border:1px solid rgba(34,211,238,.35);background:rgba(15,23,42,.9);" +
        "color:#67e8f9;font-size:12px;font-weight:600;cursor:pointer;";
    }

    btn.addEventListener("click", irParaPaginaAnterior);
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", criarBotao);
  } else {
    criarBotao();
  }
})();
