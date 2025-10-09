// Este código JavaScript implementa a animação ao passar o mouse.

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Seleciona todas as imagens de estudantes na página.
    // O querySelectorAll retorna uma lista (NodeList) de todos os elementos que têm a classe 'estudante-imagem'.
    const imagensEstudantes = document.querySelectorAll('.estudante-imagem');

    // 2. Itera (passa por) cada imagem na lista
    imagensEstudantes.forEach(imagem => {
        
        // Adiciona o Event Listener para quando o mouse entra na imagem
        imagem.addEventListener('mouseover', function() {
            // Quando o mouse entra, ele ADICIONA a classe 'highlight-js'
            // O CSS dessa classe cria o efeito de mudança de cor/filtro.
            imagem.classList.add('highlight-js');
        });

        // Adiciona o Event Listener para quando o mouse sai da imagem
        imagem.addEventListener('mouseout', function() {
            // Quando o mouse sai, ele REMOVE a classe 'highlight-js'
            // A transição no CSS garante que a imagem volte ao normal suavemente.
            imagem.classList.remove('highlight-js');
        });
        
    });

    // -------------------------------------------------------------------
    // Código extra para o Botão "Conheça Nossa Turma" (do pedido anterior)
    // -------------------------------------------------------------------

    const botaoTurma = document.getElementById('botaoTurma');

    if (botaoTurma) {
        botaoTurma.addEventListener('click', function() {
            window.location.href = 'turma.html'; 
        });
    }

});// O código JavaScript (JS) para a funcionalidade da página

document.addEventListener('DOMContentLoaded', function() {
    
    // ------------------------------------------
    // 1. FUNCIONALIDADE DO BOTÃO (O QUE ESTAVA FALHANDO)
    // ------------------------------------------
    
    // Busca o botão pelo seu ID 'botaoTurma'
    const botaoTurma = document.getElementById('botaoTurma');

    // Verifica se o botão foi encontrado antes de tentar adicionar o evento
    if (botaoTurma) {
        
        // Adiciona um evento que dispara quando o botão é clicado
        botaoTurma.addEventListener('click', function() {
            
            // A linha MÁGICA: Redireciona a janela para a nova página
            window.location.href = 'turma.html'; 
        });
        
    } else {
        // Para fins de debug no console, caso o elemento não seja encontrado
        console.error("Erro: O botão com ID 'botaoTurma' não foi encontrado. Verifique o HTML.");
    }

    
    // ------------------------------------------
    // 2. ANIMAÇÃO DE HOVER DAS FOTOS (MANTIDO)
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