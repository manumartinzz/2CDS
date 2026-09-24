// Configuração única de conexão com o Supabase.
// Este arquivo é carregado por TODAS as páginas (login, cadastro, pagamento, painel).

const SUPABASE_URL = "https://syoxvywvlwftdkpebogn.supabase.co".trim( );

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3ODczNDM3ODksImV4cCI6MjEwMjkxOTc4OX0.AjXevRAIevIOZpD5DBWJm-kM1QubOlbvugN7F_lWzpY";

if (!window.supabase?.createClient) {
  throw new Error("A biblioteca do Supabase não foi carregada.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

window.supabaseClient = supabaseClient;
