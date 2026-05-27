document.addEventListener('DOMContentLoaded', function() {

  // Form
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const success = document.getElementById('form-success');
      if (success) {
        success.classList.remove('hidden');
        this.reset();
        setTimeout(() => success.classList.add('hidden'), 4000);
      }
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Ícones Lucide - Tentativa reforçada
  function initIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
      console.log("✅ Lucide icons carregados");
    }
  }

  // Tenta várias vezes para garantir
  initIcons();
  setTimeout(initIcons, 400);
  setTimeout(initIcons, 800);

  // Element SDK (mantido original)
  const defaultConfig = { /* ... mesmo código de antes ... */ };
  // (Cole aqui todo o código do Element SDK que estava funcionando antes)
});
