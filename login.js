// login.js – AcquaSafe (Banco de Dados Admin)

const adminUsers = [
    { email: "milenakachimarck@gmail.com", senha: "123456", nome: "Milena Kachimarck" },
    { email: "mayracalegario@gmail.com",   senha: "123456", nome: "Mayra Calegario" },
    { email: "manucordeiro326@gmail.com",  senha: "123456", nome: "Manu Cordeiro" }
];

/* ==================== LOGIN NORMAL ==================== */
function handleLogin(e) {
    e.preventDefault();
    const usuario = document.getElementById('login-usuario').value.trim();
    const senha = document.getElementById('login-senha').value.trim();
    const codigo = document.getElementById('login-codigo').value.trim();
    const btn = document.getElementById('btn-text');
    const submitBtn = btn.closest('button');

    if (!usuario || !senha || !codigo) {
        showError('Preencha todos os campos.');
        return;
    }

    submitBtn.disabled = true;
    btn.textContent = 'Acessando…';

    setTimeout(() => {
        btn.textContent = '✓ Acesso concedido';
        setTimeout(() => window.location.href = 'portal.html', 800);
    }, 1200);
}

/* ==================== LOGIN ADMIN (Modal) ==================== */
function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim().toLowerCase();
    const senha = document.getElementById('admin-password').value.trim();
    const errorEl = document.getElementById('admin-error');

    const userFound = adminUsers.find(u => u.email.toLowerCase() === email && u.senha === senha);

    if (userFound) {
        sessionStorage.setItem('adminLogado', 'true');
        sessionStorage.setItem('adminUsuario', userFound.email);
        sessionStorage.setItem('adminNome', userFound.nome);
        
        errorEl.classList.add('hidden');
        document.getElementById('admin-btn-text').textContent = '✓ Acesso concedido';
        
        setTimeout(() => window.location.href = 'admin-clientes.html', 800);
    } else {
        showAdminError('E-mail ou senha incorretos.');
    }
}

function showError(msg) {
    const el = document.getElementById('login-error');
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 3000);
    }
}

function showAdminError(msg) {
    const el = document.getElementById('admin-error');
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 3000);
    }
}

function openAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
});
