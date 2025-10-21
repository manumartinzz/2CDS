function mostrarTurma() {

    window.location.href = 'turma.html'; 
}


/*
document.addEventListener('DOMContentLoaded', () => {
    const botaoTurma = document.querySelector('button');
    if (botaoTurma) {
        botaoTurma.addEventListener('click', mostrarTurma);
    }
});
*/


document.addEventListener('DOMContentLoaded', function() {
    
   
    const linkTelefone = document.querySelector('.escola-título .link');
    const corDestaque = '#ffd700'; 
    const corOriginal = '#ffffff'; 
    if (linkTelefone) {
        linkTelefone.style.transition = 'color 0.3s ease';
    }

    if (linkTelefone) {
    
        linkTelefone.addEventListener('mouseover', function() {
            linkTelefone.style.color = corDestaque;
        });

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

function mostrarCantina() {
    // Esta função redireciona o usuário para a página 'cantina.html'
    window.location.href = 'cantina.html'; 
}

// ... Mantenha sua função mostrarTurma() e os outros códigos que já existem ...

function mostrarTurma() {
    window.location.href = 'turma.html'; 
}