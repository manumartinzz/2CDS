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

function openMenu(day) {
  const contents = document.querySelectorAll('.menu-content');
  const buttons = document.querySelectorAll('.tab-btn');

  contents.forEach(c => c.classList.remove('active'));
  buttons.forEach(b => b.classList.remove('active'));

  document.getElementById(day).classList.add('active');
  event.target.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  const botaoModoEscuro = document.getElementById('modo-escuro-toggle');

  
  if (!botaoModoEscuro) return;

 
  function atualizarBotao() {
    if (document.body.classList.contains('dark-mode')) {
      botaoModoEscuro.textContent = '☀️';
    } else {
      botaoModoEscuro.textContent = '🌙';
    }
  }


  const escolhaSalva = localStorage.getItem('modoEscuro'); // "ativado" | "desativado" | null


  if (!escolhaSalva) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
    }
  } else {
    if (escolhaSalva === 'ativado') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  atualizarBotao();


  botaoModoEscuro.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('modoEscuro', 'ativado');
    } else {
      localStorage.setItem('modoEscuro', 'desativado');
    }

    atualizarBotao();
  });


  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      if (!localStorage.getItem('modoEscuro')) {
        if (e.matches) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
        atualizarBotao();
      }
    });
  }
});
