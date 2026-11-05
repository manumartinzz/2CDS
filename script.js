/*
  script.js — AcquaSafe · Landing page (index.html)
  ==================================================
  CORREÇÕES:
  - removidos defaultConfig/applyConfig/adjustColor, que nunca eram chamados
    (código morto) e podiam alterar o visual se fossem invocados;
  - formulário de contato deixou de ser "falso": agora valida os campos e
    abre o WhatsApp oficial do projeto com a mensagem preenchida;
  - smooth scroll protegido contra href="#" e anchors inexistentes;
  - lucide.createIcons() protegido caso o CDN não carregue.
*/

const CONTATO_WHATSAPP = "5541996366813";

/* ─── Formulário de contato (envio real) ─────────────────────────────────────── */
const formContato = document.getElementById("contact-form");

if (formContato) {
  formContato.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
      this.reportValidity();
      return;
    }

    const nome = (document.getElementById("name")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const mensagem = (document.getElementById("msg")?.value || "").trim();

    if (!nome || !email || !mensagem) return;

    const texto =
      "Olá! Sou " + nome + " (" + email + ").\n\n" + mensagem +
      "\n\n— Enviado pelo site AcquaSafe";
    const url = "https://wa.me/" + CONTATO_WHATSAPP +
                "?text=" + encodeURIComponent(texto);

    window.open(url, "_blank", "noopener,noreferrer");

    const ok = document.getElementById("form-success");
    if (ok) {
      ok.textContent = "✓ Abrimos o WhatsApp com sua mensagem — conclua o envio por lá.";
      ok.classList.remove("hidden");
      setTimeout(() => ok.classList.add("hidden"), 6000);
    }
    this.reset();
  });
}

/* ─── Smooth scroll ──────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  const href = a.getAttribute("href");
  if (!href || href === "#") return; // evita querySelector("#") inválido
  a.addEventListener("click", (e) => {
    const alvo = document.querySelector(href);
    if (!alvo) return;
    e.preventDefault();
    alvo.scrollIntoView({ behavior: "smooth" });
  });
});

/* ─── Legendas animadas do Hero ─────────────────────────────────────────────── */
const heroCaptions = [
  "Monitoramento 24h por dia.",
  "Alerta em menos de 5 minutos.",
  "A partir de R$ 49/mês. Assine hoje."
];
let heroCaptionIndex = 0;

function cycleHeroCaption() {
  const el = document.getElementById("hero-caption");
  if (!el) return;
  el.style.opacity = "0";
  setTimeout(() => {
    heroCaptionIndex = (heroCaptionIndex + 1) % heroCaptions.length;
    el.textContent = heroCaptions[heroCaptionIndex];
    el.style.opacity = "1";
  }, 500);
}

if (document.getElementById("hero-caption")) {
  setInterval(cycleHeroCaption, 3200);
}

/* ─── Init ──────────────────────────────────────────────────────────────────── */
if (window.lucide) lucide.createIcons();
