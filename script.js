function mostrarTurma() {
    // Você pode adicionar um pequeno efeito visual aqui, se quiser, antes de redirecionar.
    // Por exemplo, mudar temporariamente a cor do botão (embora não seja muito visível no clique).
    
    // Alerta de teste (opcional, para verificar se a função está funcionando)
    // alert("Redirecionando para a página da turma...");
    
    // Redireciona o navegador para uma nova página.
    // Substitua 'pagina-da-turma.html' pelo nome real da sua próxima página.
    window.location.href = 'turma.html'; 
}

// Observação: Como a função 'mostrarTurma' já está no atributo 'onclick' do HTML, 
// não é estritamente necessário um Listener de eventos aqui, mas é uma boa prática
// para um código JS mais complexo. Para este caso simples, o 'onclick' no HTML é suficiente,
// mas vou deixar este bloco como uma alternativa ou para ser usado futuramente:

/*
document.addEventListener('DOMContentLoaded', () => {
    const botaoTurma = document.querySelector('button');
    if (botaoTurma) {
        botaoTurma.addEventListener('click', mostrarTurma);
    }
});
*/

// =========================================================
// FUNÇÃO 1: Efeito de Mudança de Cor ao Passar o Mouse (Hover)
// =========================================================

// Esta função garante que o código só será executado depois que
// todo o HTML estiver carregado.
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Encontrar o elemento âncora (link) do telefone no rodapé
    const linkTelefone = document.querySelector('.escola-título .link');
    
    // Cor que o texto terá ao passar o mouse
    const corDestaque = '#ffd700'; // Amarelo/Dourado
    // Cor original do texto (branco)
    const corOriginal = '#ffffff'; 

    // O código CSS abaixo aplica a transição suave.
    // Embora o JS mude a cor, a suavidade é melhor no CSS.
    if (linkTelefone) {
        linkTelefone.style.transition = 'color 0.3s ease';
    }


    // Verifica se o elemento foi encontrado antes de adicionar eventos
    if (linkTelefone) {
        // Evento para quando o mouse ENTRAR no link
        linkTelefone.addEventListener('mouseover', function() {
            linkTelefone.style.color = corDestaque;
        });

        // Evento para quando o mouse SAIR do link
        linkTelefone.addEventListener('mouseout', function() {
            linkTelefone.style.color = corOriginal; 
        });
    }

    // Exemplo extra: Adicionar hover nos parágrafos do copyright do rodapé
    const footerParagrafos = document.querySelectorAll('footer.escola p');
    footerParagrafos.forEach(paragrafo => {
        // Aplicando transição CSS para suavidade
        paragrafo.style.transition = 'color 0.3s ease'; 

        paragrafo.addEventListener('mouseover', function() {
            paragrafo.style.color = corDestaque;
        });
        
        paragrafo.addEventListener('mouseout', function() {
            paragrafo.style.color = corOriginal; 
        });
    });
});


// =========================================================
// FUNÇÃO 2: Função no Escopo Global para o Botão 'Conheça nossa turma'
// =========================================================

/**
 * Função chamada pelo evento 'onclick' no botão do HTML.
 * Está no escopo global (fora do DOMContentLoaded) para ser acessível 
 * diretamente pelo atributo 'onclick'.
 */
function mostrarTurma() {
    // Você pode personalizar esta mensagem!
    alert('Nossas turmas são de Desenvolvimento de Sistemas e atendem mais de 50 alunos!');
}