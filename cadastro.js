// cadastro.js
// Substitui inteiramente o cadastro.js antigo (baseado em db.js).
// Precisa ser carregado DEPOIS de supabase-client.js.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const erroBox = document.getElementById("cad-erro");
    erroBox.classList.add("hidden");

    const nomeCompleto = document.getElementById("cad-nome").value.trim();
    const login = document.getElementById("cad-login").value.trim();
    const senha = document.getElementById("cad-senha").value;

    const apenasNumeros = login.replace(/\D/g, "");
    const ehCpf = apenasNumeros.length === 11;

    if (ehCpf) {
      erroBox.textContent = "Por enquanto, cadastre-se usando um e-mail válido (o CPF pode ser adicionado depois no seu perfil).";
      erroBox.classList.remove("hidden");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: login,
      password: senha,
      options: {
        data: { nome_completo: nomeCompleto }
      }
    });

    if (error) {
      erroBox.textContent = "Erro ao cadastrar: " + error.message;
      erroBox.classList.remove("hidden");
      return;
    }

    // Cadastro OK -> segue o fluxo do site (tela de pagamento)
    window.location.href = "pagamento.html";
  });
});