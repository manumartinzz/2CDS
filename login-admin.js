// login-admin.js
// Substitui a lógica antiga baseada em `adminUsers` + sessionStorage.
// Precisa ser carregado DEPOIS de supabase-client.js.

async function loginAdmin(event) {
  event.preventDefault();

  const email = document.getElementById("admin-email").value.trim().toLowerCase();
  const senha = document.getElementById("admin-senha").value.trim();
  const errorEl = document.getElementById("login-error");
  errorEl.classList.add("hidden");

  const { data: authData, error: authError } =
    await supabaseClient.auth.signInWithPassword({ email, password: senha });

  if (authError) {
    errorEl.textContent = "E-mail ou senha incorretos.";
    errorEl.classList.remove("hidden");
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("is_admin, nome_completo")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    errorEl.textContent = "Esta conta não tem permissão de administrador.";
    errorEl.classList.remove("hidden");
    await supabaseClient.auth.signOut();
    return;
  }

  showToast("Login realizado com sucesso! Redirecionando...", "success");
  setTimeout(() => {
    window.location.href = "admin-clientes.html";
  }, 900);
}

function showToast(msg, tipo) {
  const toast = document.createElement("div");
  toast.id = "toast";
  toast.textContent = msg;
  toast.className = `show ${
    tipo === "success"
      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
      : "bg-red-500/20 border-red-500 text-red-300"
  }`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});