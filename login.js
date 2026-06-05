// ─── Login Handler ─────────────────────────────────────────────────────────────
function handleLogin(e) {
    e.preventDefault();

    const usuario = document.getElementById('login-usuario').value.trim();
    const senha   = document.getElementById('login-senha').value.trim();
    const btn     = document.getElementById('btn-text');
    const submitBtn = btn.closest('button');

    // Validação: campos não podem estar vazios
    if (!usuario || !senha) {
        showError('Preencha todos os campos.');
        return;
    }

    // Desabilita o botão e exibe loading para evitar cliques duplos
    submitBtn.disabled = true;
    btn.textContent = 'Acessando…';

    // Simulação de autenticação (substitua pelo fetch à sua API quando disponível)
    setTimeout(() => {
        btn.textContent = '✓ Acesso concedido';

        setTimeout(() => {
            window.location.href = 'painel.html'; // ← LINHA CORRIGIDA
        }, 800);
    }, 1200);
}

// Exibe mensagem de erro no elemento #login-error do HTML
function showError(msg) {
    const el = document.getElementById('login-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');

    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
        el.classList.add('hidden');
    }, 3000);
}

// ─── Config padrão ─────────────────────────────────────────────────────────────
const defaultConfig = {
    page_title:           'Bem-vindo ao AcquaSafe',
    page_subtitle:        'Monitoramento de qualidade de água em tempo real',
    login_button_text:    'Acessar Painel',
    background_color:     '#0a0f1a',
    text_color:           '#ffffff',
    primary_action_color: '#22d3ee',
    font_family:          'DM Sans',
    font_size:            16
};

function applyConfig(config) {
    const c = { ...defaultConfig, ...config };

    const title    = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');
    const btnText  = document.getElementById('btn-text');

    if (title)    title.textContent    = c.page_title;
    if (subtitle) subtitle.textContent = c.page_subtitle;
    if (btnText)  btnText.textContent  = c.login_button_text;

    document.body.style.backgroundColor = c.background_color;
    document.body.style.color           = c.text_color;
    document.body.style.fontFamily      = `${c.font_family}, sans-serif`;
}

// ─── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    applyConfig(defaultConfig);

    if (window.elementSdk) {
        window.elementSdk.init({
            defaultConfig,
            onConfigChange: (config) => applyConfig(config),
            mapToCapabilities: (config) => ({
                recolorables: [
                    {
                        get: () => config.background_color,
                        set: (v) => {
                            config.background_color = v;
                            window.elementSdk.setConfig({ background_color: v });
                        }
                    },
                    {
                        get: () => config.text_color,
                        set: (v) => {
                            config.text_color = v;
                            window.elementSdk.setConfig({ text_color: v });
                        }
                    }
                ],
                fontEditable: {
                    get: () => config.font_family,
                    set: (v) => {
                        config.font_family = v;
                        window.elementSdk.setConfig({ font_family: v });
                    }
                }
            })
        });
    }
});
