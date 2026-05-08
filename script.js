// Form handler
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('form-success').classList.remove('hidden');
  this.reset();
  setTimeout(() => document.getElementById('form-success').classList.add('hidden'), 4000);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

// Inicializa os ícones do Lucide
function initLucide() {
  lucide.createIcons();
}

// Chama após o carregamento completo
window.addEventListener('load', initLucide);

// Element SDK (mantido igual)
const defaultConfig = { /* ... mesmo código anterior ... */ };

function applyConfig(config) { /* ... mesmo código ... */ }
function adjustColor(hex, amount) { /* ... mesmo código ... */ }

window.elementSdk.init({ /* ... mesmo código ... */ });

// Chama novamente após possível mudança dinâmica
setTimeout(initLucide, 800);
