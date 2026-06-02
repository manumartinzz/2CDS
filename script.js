// Form
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const success = document.getElementById('form-success');
  if (success) {
    success.classList.remove('hidden');
    this.reset();
    setTimeout(() => success.classList.add('hidden'), 4000);
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Lucide Icons
if (typeof lucide !== "undefined") lucide.createIcons();

// SDK (com proteção)
const defaultConfig = { /* ... mesmo de antes ... */ };

function applyConfig(config) { /* ... mesmo de antes ... */ }

if (typeof window.elementSdk !== 'undefined') {
  window.elementSdk.init({ /* ... mesmo código ... */ });
}
