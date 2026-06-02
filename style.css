// Form handler
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const successMsg = document.getElementById('form-success');
  if (successMsg) {
    successMsg.classList.remove('hidden');
    this.reset();
    
    setTimeout(() => {
      successMsg.classList.add('hidden');
    }, 4000);
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// ==================== Element SDK (com proteção) ====================
const defaultConfig = {
  hero_title: 'Acquasafe',
  hero_subtitle: 'Monitoramento inteligente da água 24h para proteger suas plantações contra contaminação.',
  cta_button: 'Entre em contato pelo email',
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

  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const ctaBtn = document.getElementById('cta-btn');
  const navBrand = document.getElementById('nav-brand');
  const app = document.getElementById('app');

  if (heroTitle) heroTitle.textContent = c.hero_title;
  if (heroSubtitle) heroSubtitle.textContent = c.hero_subtitle;
  if (ctaBtn) ctaBtn.textContent = c.cta_button;
  if (navBrand) navBrand.textContent = c.hero_title;
  if (app) {
    app.style.background = `linear-gradient(180deg, ${c.background_color} 0%, ${adjustColor(c.background_color, 20)} 100%)`;
  }

  document.querySelectorAll('.font-heading').forEach(el => {
    el.style.fontFamily = `${c.font_family}, sans-serif`;
  });

  document.body.style.fontSize = c.font_size + 'px';
}

function adjustColor(hex, amount) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Proteção contra erro do Element SDK (Canva)
if (typeof window.elementSdk !== 'undefined') {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => applyConfig(config),
    mapToCapabilities: (config) => ({
      recolorables: [ /* ... mesmo código ... */ ],
      borderables: [],
      fontEditable: { /* ... */ },
      fontSizeable: { /* ... */ }
    }),
    mapToEditPanelValues: (config) => new Map([ /* ... */ ])
  });
} else {
  // Aplica config padrão mesmo sem SDK
  applyConfig(defaultConfig);
}

// Inicializa ícones
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}
