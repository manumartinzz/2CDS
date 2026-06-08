// ====================== CONFIG & SDK ======================
const defaultConfig = {
    background_color: '#0a0f1a',
    surface_color: '#ffffff0f',
    text_color: '#ffffff',
    primary_action_color: '#22d3ee',
    secondary_action_color: '#94a3b8',
    font_family: 'DM Sans',
    font_size: 16,
    page_title: 'Painel de Controle',
    page_subtitle: 'Monitoramento técnico e parâmetros de referência.'
};

function applyConfig(config) {
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');

    if (titleEl) titleEl.textContent = config.page_title || defaultConfig.page_title;
    if (subtitleEl) subtitleEl.textContent = config.page_subtitle || defaultConfig.page_subtitle;

    document.body.style.backgroundColor = config.background_color || defaultConfig.background_color;
    document.body.style.color = config.text_color || defaultConfig.text_color;

    const font = config.font_family || defaultConfig.font_family;
    const size = config.font_size || defaultConfig.font_size;

    document.body.style.fontFamily = `${font}, DM Sans, sans-serif`;

    if (titleEl) titleEl.style.fontSize = `${size * 1.8}px`;
    if (subtitleEl) subtitleEl.style.fontSize = `${size}px`;
}

// Inicialização do SDK
if (window.element) {
    window.element.init({
        defaultConfig,
        onConfigChange: async (config) => applyConfig(config),
        mapToCapabilities: (config) => ({
            recolorables: [
                { 
                    get: () => config.background_color || defaultConfig.background_color, 
                    set: (v) => { config.background_color = v; window.element.setConfig({ background_color: v }); } 
                },
                { 
                    get: () => config.surface_color || defaultConfig.surface_color, 
                    set: (v) => { config.surface_color = v; window.element.setConfig({ surface_color: v }); } 
                },
                { 
                    get: () => config.text_color || defaultConfig.text_color, 
                    set: (v) => { config.text_color = v; window.element.setConfig({ text_color: v }); } 
                },
                { 
                    get: () => config.primary_action_color || defaultConfig.primary_action_color, 
                    set: (v) => { config.primary_action_color = v; window.element.setConfig({ primary_action_color: v }); } 
                },
                { 
                    get: () => config.secondary_action_color || defaultConfig.secondary_action_color, 
                    set: (v) => { config.secondary_action_color = v; window.element.setConfig({ secondary_action_color: v }); } 
                }
            ],
            borderables: [],
            fontEditable: {
                get: () => config.font_family || defaultConfig.font_family,
                set: (v) => { config.font_family = v; window.element.setConfig({ font_family: v }); }
            },
            fontSizeable: {
                get: () => config.font_size || defaultConfig.font_size,
                set: (v) => { config.font_size = v; window.element.setConfig({ font_size: v }); }
            }
        }),
        mapToEditPanelValues: (config) => new Map([
            ['page_title', config.page_title || defaultConfig.page_title],
            ['page_subtitle', config.page_subtitle || defaultConfig.page_subtitle]
        ])
    });
}

// ====================== CHART ======================
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('qualityChart');
    
    if (ctx) {
        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['pH', 'Turbidez', 'Cloro', 'Coliformes', 'Flúor', 'DBO'],
                datasets: [
                    {
                        label: 'Valor Atual',
                        data: [7.2, 3.5, 1.8, 0, 0.7, 4.2],
                        backgroundColor: 'rgba(34,211,238,0.7)',
                        borderRadius: 6,
                        borderSkipped: false
                    },
                    {
                        label: 'Limite Máximo',
                        data: [9.5, 5, 5, 1, 1.5, 5],
                        backgroundColor: 'rgba(99,102,241,0.3)',
                        borderRadius: 6,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        labels: { 
                            color: '#94a3b8', 
                            font: { family: 'DM Sans' } 
                        } 
                    }
                },
                scales: {
                    x: { 
                        ticks: { color: '#64748b' }, 
                        grid: { color: 'rgba(255,255,255,0.04)' } 
                    },
                    y: { 
                        ticks: { color: '#64748b' }, 
                        grid: { color: 'rgba(255,255,255,0.04)' } 
                    }
                }
            }
        });
    }

    // Criar ícones do Lucide
    lucide.createIcons();
});
