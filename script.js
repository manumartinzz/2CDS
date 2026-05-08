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
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Initialize Lucide icons
lucide.createIcons();

// ==================== Element SDK (Canva) ====================
// Remova esta parte se não for usar o editor do Canva
const defaultConfig = {
  hero_title: 'Acquasafe',
  hero_subtitle: 'Monitoramento inteligente da água 24h para proteger suas plantações contra contaminação.',
  cta_button: 'Solicite uma Demonstração',
  background_color: '#0c1a2e',
  surface_color: '#ffffff0d',
  text_color: '#ffffff',
  primary_action: '#06b6d4',
  secondary_action: '#10b981',
  font_family: 'Outfit',
  font_size: 16
};

function applyConfig(config) {
  const c = { ...defaultConfig, ...config };
  document.getElementById('hero-title').textContent = c.hero_title;
  document.getElementById('hero-subtitle').textContent = c.hero_subtitle;
  document.getElementById('cta-btn').textContent = c.cta_button;
  document.getElementById('nav-brand').textContent = c.hero_title;
  
  document.getElementById('app').style.background = `linear-gradient(180deg, ${c.background_color} 0%, ${adjustColor(c.background_color, 20)} 100%)`;
  
  document.querySelectorAll('.font-heading').forEach(el => {
    el.style.fontFamily = `${c.font_family}, sans-serif`;
  });
  document.body.style.fontSize = c.font_size + 'px';
}

function adjustColor(hex, amount) {
  let r = parseInt(hex.slice(1,3),16),
      g = parseInt(hex.slice(3,5),16),
      b = parseInt(hex.slice(5,7),16);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// Se não for usar o SDK do Canva, comente ou remova o código abaixo:
if (typeof window.elementSdk !== 'undefined') {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => applyConfig(config),
    // ... resto do código SDK
  });
}
