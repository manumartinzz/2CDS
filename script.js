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
    fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); } },
    fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); } }
  }),
  mapToEditPanelValues: (config) => new Map([
    ['hero_title', config.hero_title || defaultConfig.hero_title],
    ['hero_subtitle', config.hero_subtitle || defaultConfig.hero_subtitle],
    ['cta_button', config.cta_button || defaultConfig.cta_button]
  ])
});

lucide.createIcons();
