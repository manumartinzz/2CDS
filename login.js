// login.js – AcquaSafe

const adminUsers = [
    { email: "milenakachimarck@gmail.com", senha: "123456", nome: "Milena Kachimarck" },
    { email: "mayracalegario@gmail.com",   senha: "123456", nome: "Mayra Calegario" },
    { email: "manucordeiro326@gmail.com",  senha: "123456", nome: "Manu Cordeiro" }
];

/* ==================== LOGIN NORMAL (cliente) ==================== */
async function handleLogin(e) {
    e.preventDefault();
    const login  = document.getElementById('login-usuario').value.trim();
    const senha  = document.getElementById('login-senha').value.trim();
    const codigo = document.getElementById('login-codigo').value.trim();
    const btn = document.getElementById('btn-text');
    const submitBtn = btn.closest('button');

    if (!login || !senha || !codigo) {
        showError('Preencha todos os campos.');
        return;
    }

    submitBtn.disabled = true;
    btn.textContent = 'Verificando…';

    try {
        const resultado = await dbValidarLogin(login, senha, codigo);

        if (!resultado.ok) {
            const mensagens = {
                usuario:    'Não encontramos cadastro com este e-mail/CPF.',
                senha:      'E-mail/CPF ou senha incorretos.',
                sem_plano:  'Você ainda não tem um plano ativo. Assine para receber seu código de acesso.',
                expirado:   'Seu código de acesso expirou (validade de 30 dias). Assine novamente para gerar um novo.',
                codigo:     'Código de confirmação incorreto.',
                bloqueado:  'Esta conta está bloqueada. Fale com o administrador.',
                erro_banco: resultado.erro || 'Não foi possível consultar o banco de dados.'
            };
            showError(mensagens[resultado.motivo] || 'Não foi possível entrar. Verifique seus dados.');
            return;
        }

        sessionStorage.setItem('usuarioLogado', 'true');
        sessionStorage.setItem('usuarioEmail', resultado.usuario.emailOuCpf);
        sessionStorage.setItem('usuarioNome', resultado.usuario.nome);

        btn.textContent = 'Acessando…';
        setTimeout(() => {
            btn.textContent = '✓ Acesso concedido';
            setTimeout(() => window.location.href = 'portal.html', 800);
        }, 300);
    } catch (error) {
        console.error('Erro no login:', error);
        showError('Não foi possível entrar agora. Tente novamente.');
    } finally {
        // O redirecionamento acontece depois deste ponto; manter o botão
        // desabilitado durante a animação evita envios duplicados.
        if (!sessionStorage.getItem('usuarioLogado')) {
            submitBtn.disabled = false;
            btn.textContent = 'Acessar Painel';
        }
    }
}

/* ==================== LOGIN ADMIN (Modal) ==================== */
async function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim().toLowerCase();
    const senha = document.getElementById('admin-password').value.trim();
    const errorEl = document.getElementById('admin-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;

    try {
        const resultado = await dbValidarAdmin(email, senha, adminUsers);

        if (resultado.ok) {
            sessionStorage.setItem('adminLogado', 'true');
            sessionStorage.setItem('adminUsuario', resultado.usuario.email);
            sessionStorage.setItem('adminNome', resultado.usuario.nome);

            errorEl.classList.add('hidden');
            document.getElementById('admin-btn-text').textContent = '✓ Acesso concedido';
            setTimeout(() => window.location.href = 'admin-clientes.html', 800);
        } else {
            showAdminError(resultado.erro || 'E-mail ou senha incorretos.');
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Erro no login administrativo:', error);
        showAdminError('Não foi possível validar o acesso agora.');
        submitBtn.disabled = false;
    }
}

function showError(msg) {
    const el = document.getElementById('login-error');
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 5000);
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
