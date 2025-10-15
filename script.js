function mostrarTurma() {
    // Você pode adicionar um pequeno efeito visual aqui, se quiser, antes de redirecionar.
    // Por exemplo, mudar temporariamente a cor do botão (embora não seja muito visível no clique).
    
    // Alerta de teste (opcional, para verificar se a função está funcionando)
    // alert("Redirecionando para a página da turma...");
    
    // Redireciona o navegador para uma nova página.
    // Substitua 'pagina-da-turma.html' pelo nome real da sua próxima página.
    window.location.href = 'pagina-da-turma.html'; 
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