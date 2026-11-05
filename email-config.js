/* =========================================================
   email-config.js – AcquaSafe – Envio do código de acesso
   por e-mail real, usando o EmailJS (sem precisar de servidor).
   =========================================================

   COMO CONFIGURAR (uns 10 minutos):

   1. Crie uma conta grátis em https://www.emailjs.com
   2. Menu "Email Services" → "Add New Service" → conecte seu
      Gmail/Outlook. Copie o "Service ID" gerado.
   3. Menu "Email Templates" → "Create New Template". Use estas
      variáveis no corpo do e-mail (clique para inserir):
         {{to_name}}      → nome do cliente
         {{to_email}}     → e-mail do cliente
         {{access_code}}  → código de acesso gerado (nome oficial)
         {{passcode}}     → alternativa: o modelo pronto de OTP usa este
         {{validade}}     → data de validade do código
      O código é enviado sob vários nomes (access_code, passcode, codigo,
      codigo_acesso, code), então qualquer um deles funciona no template.
      Copie o "Template ID" gerado.
   4. Menu "Account" → "General" → copie a "Public Key".
   5. Cole os três valores nos campos abaixo.

   Se algum valor começar com "SUBSTITUA_", o envio é ignorado e o
   código passa a ser exibido apenas na tela (não trava a demonstração).
   ========================================================= */

const EMAILJS_CONFIG = {
    serviceId: 'service_kzxx0ar',
    templateId: 'template_6n0575r',
    publicKey: 'gIubsyUDncnsZjPrj'
};

let emailjsPronto = false;

(function initEmailJS() {
    if (typeof emailjs === 'undefined') return;
    if (EMAILJS_CONFIG.publicKey.startsWith('SUBSTITUA')) return; // ainda não configurado
    try {
        emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
        emailjsPronto = true;
    } catch (err) {
        console.warn('Falha ao iniciar EmailJS:', err);
    }
})();

/**
 * Envia o código de acesso por e-mail real via EmailJS.
 * Sempre resolve (nunca rejeita) com { enviado: true|false },
 * para que o restante do fluxo de pagamento/reenvio nunca trave.
 */
function enviarCodigoPorEmail({ nome, email, codigo, validade }) {
    if (!emailjsPronto) {
        console.warn('EmailJS não configurado — veja as instruções em email-config.js');
        return Promise.resolve({ enviado: false });
    }
    const codigoLimpo = String(codigo || "").trim().toUpperCase();
    if (!email || !codigoLimpo) {
        // Nunca envia um e-mail com o código em branco.
        return Promise.resolve({ enviado: false });
    }

    // Um valor inválido de validade não pode quebrar o envio (RangeError).
    let dataValidade = validade ? new Date(validade) : null;
    if (!dataValidade || Number.isNaN(dataValidade.getTime())) {
        dataValidade = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    const validadeFormatada = dataValidade.toLocaleDateString('pt-BR');

    return emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        to_name: nome || email,
        to_email: email,
        access_code: codigoLimpo,
        // O template pronto "Senha de uso único" do EmailJS usa {{passcode}}.
        // Enviando aliases, qualquer template exibe o código.
        passcode: codigoLimpo,
        codigo: codigoLimpo,
        codigo_acesso: codigoLimpo,
        code: codigoLimpo,
        validade: validadeFormatada
    }).then(() => ({ enviado: true }))
      .catch(err => {
          console.error('Falha ao enviar e-mail via EmailJS:', err);
          return { enviado: false };
      });
}

/**
 * Atalho usado por pagamento.js.
 * CORREÇÃO: antes o pagamento chamava `enviarEmailCodigoAcesso`, que não
 * existia — o typeof falhava silenciosamente e NENHUM e-mail era enviado.
 * Agora o nome existe e delega para enviarCodigoPorEmail().
 *
 * @param {string} email
 * @param {string} codigo
 * @param {{nome?: string, validade?: string}} [opcoes]
 * @returns {Promise<{enviado: boolean}>}
 */
function enviarEmailCodigoAcesso(email, codigo, opcoes = {}) {
    return enviarCodigoPorEmail({
        nome: opcoes.nome || email,
        email: email,
        codigo: codigo,
        validade: opcoes.validade
    });
}
