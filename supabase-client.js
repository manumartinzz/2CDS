
// Configuração única de conexão com o Supabase.
// Este arquivo é carregado por TODAS as páginas (login, cadastro, pagamento, painel).

const SUPABASE_URL = " https://syoxvywvlwftdkpebogn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5b3h2eXd2bHdmdGRrcGVib2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNDM3ODksImV4cCI6MjEwMjkxOTc4OX0.AjXevRAIevIOZpD5DBWJm-kM1QubOlbvugN7F_lWzpY";

// 2) Cria o cliente que será usado em todas as páginas
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);