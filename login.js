// ─────────────────────────────────────────────────────────────
// login.js – AcquaSafe (Atualizado com Banco de Dados Admin)
// ─────────────────────────────────────────────────────────────

/* ==================== BANCO DE DADOS ADMIN ==================== */
const adminUsers = [
    {
        email: "milenakachimarck@gmail.com",
        senha: "123456",
        nome: "Milena Kachimarck"
    },
    {
        email: "mayracalegario@gmail.com",
        senha: "123456",
        nome: "Mayra Calegario"
    },
    {
        email: "manucordeiro326@gmail.com",
        senha: "123456",
        nome: "Manu Cordeiro"
    }
];

/* ==================== LOGIN NORMAL (Usuário) ==================== */
function handleLogin(e) {
    e.preventDefault();
    const usuario = document.getElementById('login-usuario').value.trim();
    const senha = document.getElementById('login-senha').value.trim();
    const codigo = document.getElementById('login-codigo').value.trim();
    const btn = document.getElementById('btn-text');
    const submitBtn = btn.closest('button');

    if (!usuario || !senha || !codigo) {
        showError('Preencha todos os campos, incluindo o código de confirmação.');
        return;
    }

    submitBtn.disabled = true;
    btn.textContent = 'Acessando…';

    setTimeout(() => {
        if (codigo.length < 4) {
            showError('Código de confirmação inválido.');
            submitBtn.disabled = false;
            btn.textContent = 'Acessar Painel';
            return;
        }

        btn.textContent = '✓ Acesso concedido';
        setTimeout(() => {
            window.location.href = 'portal.html';
        }, 800);
    }, 1200);
}

/* ==================== LOGIN ADMIN ==================== */
function handleAdminLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById('admin-password'); // Vamos reutilizar o campo como email + senha
    const passwordInput = document.getElementById('admin-password');
    const adminBtn = document.getElementById('admin-btn-text');
    const submitBtn = adminBtn.closest('button');
    const errorEl = document.getElementById('admin-error');

    const email = emailInput.value.trim();   // Vamos pedir email no campo
    const senha = passwordInput.value.trim();

    if (!email || !senha) {
        showAdminError('Por favor, preencha email e senha.');
        return;
    }

    submitBtn.disabled = true;
    adminBtn.textContent = 'Validando…';

    setTimeout(() => {
        // Verifica se o usuário existe no "banco"
        const userFound = adminUsers.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && user.senha === senha
        );

        if (userFound) {
            adminBtn.textContent = '✓ Acesso concedido';
            
            // Salva dados da sessão admin
            localStorage.setItem('adminLogado', 'true');
            localStorage.setItem('adminUsuario', userFound.email);
            localStorage.setItem('adminNome', userFound.nome);

            setTimeout(() => {
                window.location.href = 'admin-clientes.html'; // Redireciona para a página principal de admin
            }, 800);
        } else {
            showAdminError('Email ou senha de administrador incorretos.');
            submitBtn.disabled = false;
            adminBtn.textContent = 'Acessar como Admin';
        }
    }, 1000);
}

/* ==================== FUNÇÕES AUXILIARES ==================== */
function showError(msg) {
    const el = document.getElementById('login-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add('hidden'), 3000);
}

function showAdminError(msg) {
    const el = document.getElementById('admin-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add('hidden'), 3000);
}

function openAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-error').classList.add('hidden');
    }
}

// Fechar modal clicando fora
document.addEventListener('click', (e) => {
    const modal = document.getElementById('adminModal');
    if (modal && e.target === modal) closeAdminModal();
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) window.lucide.createIcons();
});
