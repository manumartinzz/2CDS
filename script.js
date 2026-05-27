// Form handler + Smooth scroll + Lucide
document.addEventListener('DOMContentLoaded', () => {
  // Form
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const successMsg = document.getElementById('form-success');
      successMsg.classList.remove('hidden');
      this.reset();
      setTimeout(() => successMsg.classList.add('hidden'), 4000);
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  lucide.createIcons();
});
