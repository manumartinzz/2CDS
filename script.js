// Form handler
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const successMsg = document.getElementById('form-success');
  successMsg.classList.remove('hidden');
  this.reset();
  
  setTimeout(() => {
    successMsg.classList.add('hidden');
  }, 4000);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Inicializa ícones do Lucide
lucide.createIcons();

// Configuração do Element SDK (se você não for usar o Canva SDK, pode remover esta parte)
const defaultConfig = { /* ... mesmo código que estava ... */ };

function applyConfig(config) { /* ... mesmo código ... */ }
function adjustColor(hex, amount) { /* ... mesmo código ... */ }

// Element SDK (manter se você estiver usando o editor do Canva)
window.elementSdk.init({ /* ... todo o resto do código SDK ... */ });
