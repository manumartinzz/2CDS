/* =========================================================
   db.js – AcquaSafe – "Banco de dados" local de usuários
   =========================================================
   Usado por: cadastro.html, pagamento.html, login.html

   Estrutura de cada usuário salvo:
   {
     nome: string,
     emailOuCpf: string,        // chave de login
     senha: string,
     plano: null | { id, nome, preco },
     codigoAcesso: null | string,     // gerado após o pagamento
     codigoValidade: null | string    // ISO date, válido por 30 dias
   }
   ========================================================= */

const DB_KEY = 'acqua_usuarios';

function dbListarUsuarios() {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
}

function dbSalvarUsuarios(lista) {
    localStorage.setItem(DB_KEY, JSON.stringify(lista));
}

function dbNormalizar(login) {
    return (login || '').trim().toLowerCase();
}

function dbEncontrarUsuario(login) {
    const chave = dbNormalizar(login);
    return dbListarUsuarios().find(u => dbNormalizar(u.emailOuCpf) === chave) || null;
}

/**
 * Cria um novo cadastro. Retorna { ok:false, erro } se já existir
 * uma conta com o mesmo e-mail/CPF.
 */
function dbCadastrarUsuario({ nome, emailOuCpf, senha }) {
    if (dbEncontrarUsuario(emailOuCpf)) {
        return { ok: false, erro: 'Já existe uma conta cadastrada com este e-mail ou CPF.' };
    }

    const usuarios = dbListarUsuarios();
    const novo = {
        nome: (nome || '').trim(),
        emailOuCpf: (emailOuCpf || '').trim(),
        senha: senha,
        plano: null,
        codigoAcesso: null,
        codigoValidade: null
    };
    usuarios.push(novo);
    dbSalvarUsuarios(usuarios);
    return { ok: true, usuario: novo };
}

/**
 * Gera um código de acesso legível, ex: "AQ7F-92XK"
 * (sem 0/O e 1/I para evitar confusão na digitação).
 */
function dbGerarCodigo() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
        codigo += chars[Math.floor(Math.random() * chars.length)];
        if (i === 3) codigo += '-';
    }
    return codigo;
}

/**
 * Confirma o pagamento de um plano: gera um novo código de acesso
 * válido por 30 dias e grava no "banco de dados" do usuário.
 */
function dbAtivarPlano(login, plano) {
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

/**
 * Valida um login completo: usuário existe, senha confere, existe
 * código de acesso ativo e ele não expirou (30 dias após o pagamento),
 * e o código digitado bate com o gerado no sistema.
 */
function dbValidarLogin(login, senha, codigo) {
    const usuario = dbEncontrarUsuario(login);
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
