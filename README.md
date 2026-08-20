# AcquaSafe + Supabase

A aplicação agora está preparada para usar o Supabase como banco de dados e autenticação.

## Configuração rápida

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor**, cole o conteúdo de [`supabase-schema.sql`](supabase-schema.sql) e execute.
3. Abra **Project Settings > API** e copie a **Project URL** e a chave **anon/public**.
4. Cole os valores em [`supabase-config.js`](supabase-config.js):

   ```js
   window.SUPABASE_CONFIG = {
       url: 'https://seu-projeto.supabase.co',
       anonKey: 'sua-chave-anon-public'
   };
   ```

5. Em **Authentication > Providers > Email**, desative **Confirm email** se quiser manter o fluxo atual de cadastro → pagamento imediato. Com a confirmação ativada, o usuário precisará confirmar o e-mail e entrar novamente antes de assinar.
6. Sirva os arquivos por um servidor HTTP, por exemplo:

   ```bash
   python3 -m http.server 8080 --bind 0.0.0.0
   ```

   Não abra os HTML diretamente com `file://`, pois o navegador pode bloquear os módulos e as requisições.

## O que foi criado

- **Supabase Auth**: senhas não ficam mais em `localStorage` quando o Supabase está configurado.
- **`profiles`**: nome, identificador, e-mail, telefone, função e status do cliente.
- **`plans`**: catálogo dos planos Básico, Profissional e Empresarial.
- **`subscriptions`**: plano ativo, preço, início e vencimento de 30 dias.
- **`access_codes`**: código de acesso vinculado à assinatura.
- **`diseases`**: conteúdo administrado no painel de doenças.
- **RLS (Row Level Security)**: clientes leem apenas os próprios dados; administradores podem gerenciar clientes e doenças.
- **`activate_plan`**: função transacional que busca o preço no banco e cria assinatura + código sem confiar no preço enviado pelo navegador.

Com a configuração preenchida, cadastro, login, pagamento simulado, reenvio do código, painel de clientes, bloqueios e doenças usam o Supabase. Sem configuração, o site conserva um fallback local para demonstração.

## Criar um administrador

1. Em **Authentication > Users**, crie um usuário com e-mail e senha.
2. Depois de o trigger criar o perfil, no SQL Editor execute:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'admin@exemplo.com';
   ```

3. Entre em `login-admin.html` com esse usuário.

Os três administradores que estavam hardcoded no protótipo continuam disponíveis **somente quando o Supabase não está configurado**, para não quebrar a demonstração local. Ao preencher a configuração, o acesso administrativo passa a exigir um usuário Auth com `role = 'admin'`.

## Segurança e produção

- A chave `anon/public` pode aparecer no front-end; a chave `service_role` **nunca** deve ser colocada em HTML, JavaScript público ou Git.
- O checkout atual continua sendo uma simulação visual. Antes de cobrar dinheiro, conecte um gateway real por uma Edge Function ou por um backend, valide o webhook no servidor e só então chame a ativação da assinatura.
- O envio do código continua usando a configuração existente do EmailJS. Para CPF, o Supabase usa um identificador técnico; para uso real, prefira e-mail ou adapte o fluxo para autenticação por telefone.
