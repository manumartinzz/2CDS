// Espera o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', function() {

  // Form handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const successMsg = document.getElementById('form-success');
      if (successMsg) {
        successMsg.classList.remove('hidden');
        this.reset();
        setTimeout(() => successMsg.classList.add('hidden'), 4000);
      }
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Criar ícones do Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    console.warn('Lucide não foi carregado corretamente.');
  }

  // Element SDK
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
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const ctaBtn = document.getElementById('cta-btn');
    const navBrand = document.getElementById('nav-brand');

    if (heroTitle) heroTitle.textContent = c.hero_title;
    if (heroSubtitle) heroSubtitle.textContent = c.hero_subtitle;
    if (ctaBtn) ctaBtn.textContent = c.cta_button;
    if (navBrand) navBrand.textContent = c.hero_title;

    const app = document.getElementById('app');
    if (app) {
      app.style.background = `linear-gradient(180deg, ${c.background_color} 0%, ${adjustColor(c.background_color, 20)} 100%)`;
    }

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

  // Inicializa o Element SDK
  if (typeof window.elementSdk !== 'undefined') {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange: async (config) => applyConfig(config),
      mapToCapabilities: (config) => ({
        recolorables: [
          { get: () => config.background_color || defaultConfig.background_color, set: (v) => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
          { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
          { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
          { get: () => config.primary_action || defaultConfig.primary_action, set: (v) => { config.primary_action = v; window.elementSdk.setConfig({ primary_action: v }); } },
          { get: () => config.secondary_action || defaultConfig.secondary_action, set: (v) => { config.secondary_action = v; window.elementSdk.setConfig({ secondary_action: v }); } }
        ],
        borderables: [],
        fontEditable: { 
          get: () => config.font_family || defaultConfig.font_family, 
          set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); } 
        },
        fontSizeable: { 
          get: () => config.font_size || defaultConfig.font_size, 
          set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); } 
        }
      }),
      mapToEditPanelValues: (config) => new Map([
        ['hero_title', config.hero_title || defaultConfig.hero_title],
        ['hero_subtitle', config.hero_subtitle || defaultConfig.hero_subtitle],
        ['cta_button', config.cta_button || defaultConfig.cta_button]
      ])
    });
  }
});
