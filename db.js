/* =========================================================
   db.js – AcquaSafe – persistência
   =========================================================
   Com supabase-config.js preenchido, este arquivo usa:
   - Supabase Auth para senhas e sessões;
   - public.profiles para os dados do usuário;
   - public.plans, public.subscriptions e public.access_codes para planos;
   - RLS e a função activate_plan para proteger os dados.

   Sem configuração, mantém um fallback local para a demonstração. O fallback
   não deve ser usado em produção: localStorage não é um banco compartilhado e
   não protege senhas.
   ========================================================= */

const DB_KEY = 'acqua_usuarios';

function dbUsarSupabase() {
    return Boolean(window.supabaseConfigurado && window.supabaseClient);
}

function dbListarUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    } catch (error) {
        console.warn('Não foi possível ler o armazenamento local:', error);
        return [];
    }
}

function dbSalvarUsuarios(lista) {
    localStorage.setItem(DB_KEY, JSON.stringify(lista));
}

function dbNormalizar(login) {
    return (login || '').trim().toLowerCase();
}

function dbChaveIdentificador(login) {
    const valor = (login || '').trim();
    if (valor.includes('@')) return valor.toLowerCase();

    const somenteNumeros = valor.replace(/\D/g, '');
    return somenteNumeros || valor.toLowerCase();
}

/* Supabase Auth exige e-mail para autenticação. Para manter o CPF como opção
   na interface, ele recebe um identificador técnico; para uso real, prefira
   cadastrar com e-mail ou troque este fluxo por autenticação por telefone. */
function dbEmailAuth(login) {
    const valor = dbNormalizar(login);
    if (valor.includes('@')) return valor;

    const cpf = (login || '').replace(/\D/g, '');
    return `cpf-${cpf}@acquasafe.local`;
}

function dbGerarCodigo() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
        codigo += chars[Math.floor(Math.random() * chars.length)];
        if (i === 3) codigo += '-';
    }
    return codigo;
}

function dbMensagemErro(error, fallback) {
    const mensagem = String(error && (error.message || error.error_description) || '').toLowerCase();

    if (mensagem.includes('already registered') || mensagem.includes('already exists')) {
        return 'Já existe uma conta cadastrada com este e-mail ou CPF.';
    }
    if (mensagem.includes('invalid login credentials')) {
        return 'E-mail/CPF ou senha incorretos.';
    }
    if (mensagem.includes('email not confirmed')) {
        return 'Confirme seu e-mail antes de entrar. Verifique a caixa de entrada.';
    }
    if (mensagem.includes('not_authenticated')) {
        return 'Sua sessão expirou. Entre novamente para continuar.';
    }
    if (mensagem.includes('account_blocked')) {
        return 'Esta conta está bloqueada. Fale com o administrador.';
    }
    if (mensagem.includes('plan_not_found')) {
        return 'O plano selecionado não está disponível.';
    }
    if (mensagem.includes('relation') && mensagem.includes('does not exist')) {
        return 'O banco ainda não foi criado. Execute o arquivo supabase-schema.sql no SQL Editor.';
    }

    return fallback || 'Não foi possível concluir a operação. Tente novamente.';
}

function dbMapearPerfil(profile, subscription, accessCode) {
    if (!profile) return null;

    return {
        id: profile.id,
        nome: profile.full_name,
        emailOuCpf: profile.identifier,
        email: profile.email,
        senha: undefined,
        plano: subscription ? {
            id: subscription.plan_id,
            nome: subscription.plan_name,
            preco: Number(subscription.price)
        } : null,
        codigoAcesso: accessCode ? accessCode.code : null,
        codigoValidade: accessCode ? accessCode.expires_at : null,
        status: profile.status
    };
}

async function dbObterContaAtual() {
    if (!dbUsarSupabase()) return null;

    const { data: userResult, error: userError } = await window.supabaseClient.auth.getUser();
    if (userError || !userResult || !userResult.user) return null;

    const user = userResult.user;
    const { data: profile, error: profileError } = await window.supabaseClient
        .from('profiles')
        .select('id, full_name, email, identifier, identifier_key, status, role')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) return null;

    const { data: subscriptions, error: subscriptionError } = await window.supabaseClient
        .from('subscriptions')
        .select('id, plan_id, plan_name, price, status, started_at, expires_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (subscriptionError) throw subscriptionError;

    const subscription = (subscriptions || []).find(item =>
        item.status === 'active' && new Date(item.expires_at) > new Date()
    ) || null;

    const { data: accessCodes, error: accessError } = await window.supabaseClient
        .from('access_codes')
        .select('code, expires_at, subscription_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (accessError) throw accessError;

    const accessCode = subscription
        ? (accessCodes || []).find(code => code.subscription_id === subscription.id) || null
        : (accessCodes || [])[0] || null;

    return dbMapearPerfil(profile, subscription, accessCode);
}

function dbEncontrarUsuarioLocal(login) {
    const chave = dbNormalizar(login);
    return dbListarUsuarios().find(u => dbNormalizar(u.emailOuCpf) === chave) || null;
}

/** Retorna a conta atual. No Supabase, por segurança, não pesquisa usuários
 * arbitrários: a sessão autenticada só pode consultar o próprio perfil. */
async function dbEncontrarUsuario(login) {
    if (!dbUsarSupabase()) return dbEncontrarUsuarioLocal(login);

    try {
        const usuario = await dbObterContaAtual();
        if (!usuario) return null;

        const chaveInformada = dbChaveIdentificador(login);
        const chaveSalva = dbChaveIdentificador(usuario.emailOuCpf);
        const emailSalvo = dbNormalizar(usuario.email || '');

        return chaveInformada === chaveSalva || chaveInformada === emailSalvo ? usuario : null;
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
    }
}

/** Cria uma conta usando o Supabase Auth ou o fallback de demonstração. */
async function dbCadastrarUsuario({ nome, emailOuCpf, senha }) {
    if (!dbUsarSupabase()) {
        if (dbEncontrarUsuarioLocal(emailOuCpf)) {
            return { ok: false, erro: 'Já existe uma conta cadastrada com este e-mail ou CPF.' };
        }

        const usuarios = dbListarUsuarios();
        const novo = {
            nome: (nome || '').trim(),
            emailOuCpf: (emailOuCpf || '').trim(),
            senha,
            plano: null,
            codigoAcesso: null,
            codigoValidade: null
        };
        usuarios.push(novo);
        dbSalvarUsuarios(usuarios);
        return { ok: true, usuario: novo };
    }

    const identificador = (emailOuCpf || '').trim();
    const { data, error } = await window.supabaseClient.auth.signUp({
        email: dbEmailAuth(identificador),
        password: senha,
        options: {
            data: {
                full_name: (nome || '').trim(),
                identifier: identificador,
                identifier_key: dbChaveIdentificador(identificador)
            }
        }
    });

    if (error) return { ok: false, erro: dbMensagemErro(error) };
    if (!data || !data.user) {
        return { ok: false, erro: 'Não foi possível criar a conta.' };
    }

    // O fluxo leva o cliente direto ao pagamento. Por isso, a sessão precisa
    // existir após o cadastro (desative "Confirm email" durante esta demo).
    if (!data.session) {
        return {
            ok: false,
            erro: 'Cadastro criado. Confirme o e-mail recebido e depois entre novamente para escolher um plano.'
        };
    }

    try {
        const usuario = await dbObterContaAtual();
        return {
            ok: true,
            usuario: usuario || {
                id: data.user.id,
                nome: (nome || '').trim(),
                emailOuCpf: identificador
            }
        };
    } catch (profileError) {
        return { ok: false, erro: dbMensagemErro(profileError) };
    }
}

/** Ativa um plano. No Supabase, o preço e a validade são calculados no banco. */
async function dbAtivarPlano(login, plano) {
    if (!dbUsarSupabase()) {
        const usuarios = dbListarUsuarios();
        const idx = usuarios.findIndex(u => dbNormalizar(u.emailOuCpf) === dbNormalizar(login));
        if (idx === -1) {
            return { ok: false, erro: 'Usuário não encontrado. Cadastre-se primeiro.' };
        }

        const codigo = dbGerarCodigo();
        const validade = new Date();
        validade.setDate(validade.getDate() + 30);

        usuarios[idx].plano = plano;
        usuarios[idx].codigoAcesso = codigo;
        usuarios[idx].codigoValidade = validade.toISOString();
        dbSalvarUsuarios(usuarios);
        return { ok: true, usuario: usuarios[idx], codigo, validade: validade.toISOString() };
    }

    const codigo = dbGerarCodigo();
    const { data, error } = await window.supabaseClient.rpc('activate_plan', {
        p_plan_id: plano.id,
        p_code: codigo
    });

    if (error) return { ok: false, erro: dbMensagemErro(error) };

    const resultado = Array.isArray(data) ? data[0] : data;
    if (!resultado) return { ok: false, erro: 'O plano não pôde ser ativado.' };

    try {
        return {
            ok: true,
            usuario: await dbObterContaAtual(),
            codigo: resultado.codigo_acesso,
            validade: resultado.validade
        };
    } catch (profileError) {
        return { ok: false, erro: dbMensagemErro(profileError) };
    }
}

/** Autentica com Auth e valida o código de acesso ativo do usuário. */
async function dbValidarLogin(login, senha, codigo) {
    if (!dbUsarSupabase()) {
        const usuario = dbEncontrarUsuarioLocal(login);
        if (!usuario) return { ok: false, motivo: 'usuario' };
        if (usuario.senha !== senha) return { ok: false, motivo: 'senha' };
        if (!usuario.codigoAcesso) return { ok: false, motivo: 'sem_plano' };

        const validade = new Date(usuario.codigoValidade);
        if (new Date() > validade) return { ok: false, motivo: 'expirado' };

        const digitado = (codigo || '').trim().toUpperCase();
        const salvo = usuario.codigoAcesso.toUpperCase();
        if (digitado !== salvo) return { ok: false, motivo: 'codigo' };
        return { ok: true, usuario };
    }

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: dbEmailAuth(login),
        password: senha
    });

    if (error || !data || !data.user) {
        return { ok: false, motivo: 'senha' };
    }

    try {
        const usuario = await dbObterContaAtual();
        if (!usuario) {
            await dbSair();
            return { ok: false, motivo: 'usuario' };
        }
        if (usuario.status === 'blocked') {
            await dbSair();
            return { ok: false, motivo: 'bloqueado' };
        }

        const { data: codes, error: codeError } = await window.supabaseClient
            .from('access_codes')
            .select('code, expires_at, subscription_id, created_at')
            .eq('user_id', data.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (codeError) throw codeError;

        const lista = codes || [];
        if (lista.length === 0) return { ok: false, motivo: 'sem_plano' };

        const atual = lista.find(item => new Date(item.expires_at) > new Date());
        if (!atual) return { ok: false, motivo: 'expirado' };

        const digitado = (codigo || '').trim().toUpperCase();
        if (digitado !== String(atual.code).toUpperCase()) {
            return { ok: false, motivo: 'codigo' };
        }

        return { ok: true, usuario };
    } catch (queryError) {
        await dbSair();
        return { ok: false, motivo: 'erro_banco', erro: dbMensagemErro(queryError) };
    }
}

/** Login de administrador. Os administradores remotos são usuários do Auth
 * marcados com role = admin na tabela profiles. */
async function dbValidarAdmin(email, senha, usuariosFallback) {
    if (!dbUsarSupabase()) {
        const userFound = (usuariosFallback || []).find(user =>
            user.email.toLowerCase() === email.toLowerCase() && user.senha === senha
        );
        return userFound
            ? { ok: true, usuario: userFound }
            : { ok: false, erro: 'E-mail ou senha incorretos.' };
    }

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: dbNormalizar(email),
        password: senha
    });

    if (error || !data || !data.user) {
        return { ok: false, erro: 'E-mail ou senha incorretos.' };
    }

    try {
        const { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('full_name, email, role, status')
            .eq('id', data.user.id)
            .maybeSingle();

        if (profileError) throw profileError;
        if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
            await dbSair();
            return { ok: false, erro: 'Esta conta não possui acesso de administrador.' };
        }

        return {
            ok: true,
            usuario: {
                email: profile.email || email,
                nome: profile.full_name
            }
        };
    } catch (queryError) {
        await dbSair();
        return { ok: false, erro: dbMensagemErro(queryError) };
    }
}

async function dbListarClientes() {
    if (!dbUsarSupabase()) return [];

    const { data: profiles, error: profileError } = await window.supabaseClient
        .from('profiles')
        .select('id, full_name, email, identifier, phone, role, status, created_at')
        .order('created_at', { ascending: false });
    if (profileError) throw profileError;

    const { data: subscriptions, error: subscriptionError } = await window.supabaseClient
        .from('subscriptions')
        .select('id, user_id, plan_name, status, expires_at, created_at')
        .order('created_at', { ascending: false });
    if (subscriptionError) throw subscriptionError;

    return (profiles || []).filter(profile => profile.role !== 'admin').map(profile => {
        const sub = (subscriptions || []).find(item => item.user_id === profile.id && item.status === 'active');
        const ativo = sub && new Date(sub.expires_at) > new Date();
        return {
            id: profile.id,
            nome: profile.full_name,
            cpf: profile.identifier && !profile.identifier.includes('@') ? profile.identifier : '',
            email: profile.email || profile.identifier,
            tel: profile.phone || '—',
            plano: sub ? sub.plan_name : 'Sem plano',
            status: profile.status === 'blocked' ? 'bloqueado' : (ativo ? 'ativo' : 'pendente'),
            motivo: profile.status === 'blocked' ? 'Bloqueio administrativo' : ''
        };
    });
}

async function dbAtualizarStatusCliente(id, bloqueado) {
    if (!dbUsarSupabase()) return { ok: true };

    const { error } = await window.supabaseClient
        .from('profiles')
        .update({ status: bloqueado ? 'blocked' : 'active' })
        .eq('id', id);
    return error
        ? { ok: false, erro: dbMensagemErro(error) }
        : { ok: true };
}

async function dbListarDoencas() {
    if (!dbUsarSupabase()) return [];

    const { data, error } = await window.supabaseClient
        .from('diseases')
        .select('id, name, category, description, active, created_at, updated_at')
        .order('name', { ascending: true });
    if (error) throw error;

    return (data || []).map(item => ({
        id: item.id,
        nome: item.name,
        categoria: item.category || '',
        descricao: item.description || ''
    }));
}

async function dbSalvarDoenca(doenca) {
    if (!dbUsarSupabase()) return { ok: true };

    const payload = {
        name: doenca.nome,
        category: doenca.categoria || null,
        description: doenca.descricao || null
    };
    const query = doenca.id
        ? window.supabaseClient.from('diseases').update(payload).eq('id', doenca.id)
        : window.supabaseClient.from('diseases').insert(payload);
    const { error } = await query;
    return error ? { ok: false, erro: dbMensagemErro(error) } : { ok: true };
}

async function dbExcluirDoenca(id) {
    if (!dbUsarSupabase()) return { ok: true };
    const { error } = await window.supabaseClient.from('diseases').delete().eq('id', id);
    return error ? { ok: false, erro: dbMensagemErro(error) } : { ok: true };
}

async function dbSair() {
    if (dbUsarSupabase()) {
        await window.supabaseClient.auth.signOut();
    }
}
