// Configuração única de conexão com o Supabase.
// Este arquivo é carregado por todas as páginas.

const SUPABASE_URL =
  "https://syoxvywvlwftdkpebogn.supabase.co".trim( );

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5b3h2eXd2bHdmdGRrcGVib2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNDM3ODksImV4cCI6MjEwMjkxOTc4OX0.AjXevRAIevIOZpD5DBWJm-kM1QubOlbvugN7F_lWzpY";

if (!window.supabase?.createClient) {
  throw new Error("A biblioteca do Supabase não foi carregada.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

window.supabaseClient = supabaseClient;
