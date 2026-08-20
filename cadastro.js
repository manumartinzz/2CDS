/* cadastro.js – AcquaSafe – Criação de conta */

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    const form = document.getElementById('formCadastro');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome  = document.getElementById('cad-nome').value.trim();
        const login = document.getElementById('cad-login').value.trim();
        const senha = document.getElementById('cad-senha').value;
        const erroEl = document.getElementById('cad-erro');

        if (!nome || !login || !senha) return;

        const resultado = dbCadastrarUsuario({ nome, emailOuCpf: login, senha });

        if (!resultado.ok) {
            erroEl.textContent = resultado.erro;
            erroEl.classList.remove('hidden');
            return;
        }

        erroEl.classList.add('hidden');

        // Leva o e-mail/CPF cadastrado para a tela de pagamento, já pronto pra usar
        sessionStorage.setItem('acqua_cadastro_pendente', login);
        window.location.href = 'pagamento.html';
    });
});
