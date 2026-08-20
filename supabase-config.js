/*
 * Configuração pública do Supabase.
 *
 * 1. No Supabase, abra Project Settings > API.
 * 2. Cole a URL do projeto e a chave anon/public abaixo.
 * 3. Nunca use a chave service_role no navegador.
 *
 * Enquanto os campos estiverem vazios, o app usa o armazenamento local apenas
 * para permitir a demonstração. Em produção, preencha estes dois valores e
 * execute supabase-schema.sql no SQL Editor.
 */
window.SUPABASE_CONFIG = {
    url: '',
    anonKey: ''
};

(function inicializarSupabase() {
    const config = window.SUPABASE_CONFIG || {};
    const configurado = Boolean(
        config.url &&
        config.anonKey &&
        window.supabase &&
        typeof window.supabase.createClient === 'function'
    );

    window.supabaseConfigurado = configurado;

    if (configurado) {
        window.supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    } else {
        window.supabaseClient = null;
    }
})();
