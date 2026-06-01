document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simulação de envio
    const successMsg = document.getElementById('successMessage');
    successMsg.classList.remove('hidden');
    
    // Limpa o formulário
    this.reset();
    
    // Esconde mensagem após 5 segundos
    setTimeout(() => {
        successMsg.classList.add('hidden');
    }, 5000);
});
