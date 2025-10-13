// O código JavaScript (JS) para a funcionalidade da página

document.addEventListener('DOMContentLoaded', function() {

    // ------------------------------------------
    // 1. FUNCIONALIDADE DO BOTÃO "Conheça Nossa Turma"
    // ------------------------------------------

    // Busca o botão pelo seu ID 'botaoTurma'
    const botaoTurma = document.getElementById('botaoTurma');

    // Verifica se o botão foi encontrado antes de tentar adicionar o evento
    if (botaoTurma) {

        // Adiciona um evento que dispara quando o botão é clicado
        botaoTurma.addEventListener('click', function() {

            // Redireciona a janela para a nova página (isso deve funcionar!)
            window.location.href = 'turma.html';
        });

    } else {
        // Para fins de debug no console
        console.error("Erro: O botão com ID 'botaoTurma' não foi encontrado. Verifique o HTML.");
    }


    // ------------------------------------------
    // 2. ANIMAÇÃO DE HOVER DAS FOTOS
    // ------------------------------------------

    const imagensEstudantes = document.querySelectorAll('.estudante-imagem');

    imagensEstudantes.forEach(imagem => {

        // Adiciona a classe de destaque ao entrar
        imagem.addEventListener('mouseover', function() {
            imagem.classList.add('highlight-js');
        });

        // Remove a classe de destaque ao sair
        imagem.addEventListener('mouseout', function() {
            imagem.classList.remove('highlight-js');
        });

    });

});