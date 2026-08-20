/* cadastro.js – AcquaSafe – Criação de conta */

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    const form = document.getElementById('formCadastro');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nome  = document.getElementById('cad-nome').value.trim();
        const login = document.getElementById('cad-login').value.trim();
        const senha = document.getElementById('cad-senha').value;
        const erroEl = document.getElementById('cad-erro');
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!nome || !login || !senha) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando conta…';
        erroEl.classList.add('hidden');

        try {
            const resultado = await dbCadastrarUsuario({ nome, emailOuCpf: login, senha });

            if (!resultado.ok) {
                erroEl.textContent = resultado.erro;
                erroEl.classList.remove('hidden');
                return;
            }

            // Leva o e-mail/CPF cadastrado para a tela de pagamento, já pronto pra usar
            sessionStorage.setItem('acqua_cadastro_pendente', login);
            window.location.href = 'pagamento.html';
        } catch (error) {
            console.error('Erro no cadastro:', error);
            erroEl.textContent = 'Não foi possível criar a conta agora. Tente novamente.';
            erroEl.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Finalizar Cadastro';
        }
    });
});
