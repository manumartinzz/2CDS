// ─── Login Handler ─────────────────────────────────────────────────────────────
function handleLogin(e) {
    e.preventDefault();

    const usuario = document.getElementById('login-usuario').value.trim();
    const senha   = document.getElementById('login-senha').value.trim();
    const codigo  = document.getElementById('login-codigo').value.trim();
    const btn     = document.getElementById('btn-text');
    const submitBtn = btn.closest('button');

    // Validação: campos não podem estar vazios
    if (!usuario || !senha || !codigo) {
        showError('Preencha todos os campos, incluindo o código de confirmação.');
        return;
    }

    // Desabilita o botão e exibe loading para evitar cliques duplos
    submitBtn.disabled = true;
    btn.textContent = 'Acessando…';

    // Simulação de autenticação
    setTimeout(() => {
        // Exemplo simples de validação de código (opcional)
        if (codigo.length < 4) {
            showError('Código de confirmação inválido.');
            submitBtn.disabled = false;
            btn.textContent = 'Acessar Painel';
            return;
        }

        btn.textContent = '✓ Acesso concedido';

        setTimeout(() => {
            window.location.href = 'painel.html';
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

// ─── Admin Login Functions ──────────────────────────────────────────────────────
function openAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Inicializa lucide icons no modal
        if (window.lucide) window.lucide.createIcons();
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.add('hidden');
        // Limpar campos
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-error').classList.add('hidden');
    }
}

function handleAdminLogin(e) {
    e.preventDefault();

    const adminPassword = document.getElementById('admin-password').value.trim();
    const adminBtn = document.getElementById('admin-btn-text');
    const submitBtn = adminBtn.closest('button');
    const errorEl = document.getElementById('admin-error');

    // Validação
    if (!adminPassword) {
        showAdminError('Por favor, insira a senha de administrador');
        return;
    }

    // Desabilita o botão
    submitBtn.disabled = true;
    adminBtn.textContent = 'Validando…';

    // Simula validação de senha
    setTimeout(() => {
        // MUDE ESSA SENHA PARA A SUA SENHA REAL
        const ADMIN_PASSWORD = 'admin123';

        if (adminPassword === ADMIN_PASSWORD) {
            // Senha correta - redireciona para painel admin
            adminBtn.textContent = '✓ Acesso concedido';
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminLoggedIn', 'true');

            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 800);
        } else {
            // Senha incorreta
            showAdminError('Senha de administrador incorreta');
            submitBtn.disabled = false;
            adminBtn.textContent = 'Acessar como Admin';
        }
    }, 1000);
}

function showAdminError(msg) {
    const el = document.getElementById('admin-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');

    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
        el.classList.add('hidden');
    }, 3000);
}

// ─── Fechar modal ao clicar fora ────────────────────────────────────────────────
document.addEventListener('click', (e) => {
    const modal = document.getElementById('adminModal');
    if (modal && e.target === modal) {
        closeAdminModal();
    }
});

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
    if (window.lucide) window.lucide.createIcons();
    applyConfig(defaultConfig);
});
