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
         {{access_code}}  → código de acesso gerado
         {{validade}}     → data de validade do código
      Copie o "Template ID" gerado.
   4. Menu "Account" → "General" → copie a "Public Key".
   5. Cole os três valores nos campos abaixo.

   Enquanto os valores abaixo continuarem como "SUBSTITUA_...",
   o sistema funciona normalmente: o código só deixa de ser
   enviado por e-mail e passa a ser exibido na tela como
   confirmação (para não travar a demonstração do TCC).
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
        console.warn('EmailJS não configurado ainda — veja as instruções em email-config.js');
        return Promise.resolve({ enviado: false });
    }

    const validadeFormatada = new Date(validade).toLocaleDateString('pt-BR');

    return emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        to_name: nome,
        to_email: email,
        access_code: codigo,
        validade: validadeFormatada
    }).then(() => ({ enviado: true }))
      .catch(err => {
          console.error('Falha ao enviar e-mail via EmailJS:', err);
          return { enviado: false };
      });
}
