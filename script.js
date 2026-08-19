// ─── Formulário de contato ─────────────────────────────────────────────────────
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('form-success').classList.remove('hidden');
  this.reset();
  setTimeout(() => document.getElementById('form-success').classList.add('hidden'), 4000);
});

// ─── Smooth scroll ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

// ─── Config padrão ─────────────────────────────────────────────────────────────
const defaultConfig = {
  hero_title:       'Acquasafe',
  hero_subtitle:    'Sensores inteligentes monitoram sua água 24h por dia e protegem sua lavoura contra contaminação — em tempo real.',
  cta_button:       'Entre em contato pelo email',
  background_color: '#0c1a2e',
  surface_color:    '#ffffff0d',
  text_color:       '#ffffff',
  primary_action:   '#06b6d4',
  secondary_action: '#10b981',
  font_family:      'Outfit',
  font_size:        16
};

function applyConfig(config) {
  const c = { ...defaultConfig, ...config };
  document.getElementById('hero-title').textContent   = c.hero_title;
  document.getElementById('hero-subtitle').textContent = c.hero_subtitle;
  document.getElementById('cta-btn').textContent       = c.cta_button;
  document.getElementById('nav-brand').textContent     = c.hero_title;
  document.getElementById('app').style.background =
    `linear-gradient(180deg, ${c.background_color} 0%, ${adjustColor(c.background_color, 20)} 100%)`;
  document.querySelectorAll('.font-heading').forEach(el => {
    el.style.fontFamily = `${c.font_family}, sans-serif`;
  });
  document.body.style.fontSize = c.font_size + 'px';
}

function adjustColor(hex, amount) {
  let r = parseInt(hex.slice(1,3), 16),
      g = parseInt(hex.slice(3,5), 16),
      b = parseInt(hex.slice(5,7), 16);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ─── Legendas do "comercial" animado do Hero ───────────────────────────────────
const heroCaptions = [
  'Água monitorada em tempo real.',
  'Alertas antes do problema acontecer.',
  'Sua colheita, protegida 24h por dia.'
];
let heroCaptionIndex = 0;

function cycleHeroCaption() {
  const el = document.getElementById('hero-caption');
  if (!el) return;
  el.style.opacity = 0;
  setTimeout(() => {
    heroCaptionIndex = (heroCaptionIndex + 1) % heroCaptions.length;
    el.textContent = heroCaptions[heroCaptionIndex];
    el.style.opacity = 1;
  }, 500);
}

setInterval(cycleHeroCaption, 3200);

// ─── Init ──────────────────────────────────────────────────────────────────────
lucide.createIcons();
