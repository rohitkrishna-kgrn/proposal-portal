const nodemailer = require('nodemailer');
const Config = require('../models/Config');

async function getTransporter() {
  const smtpConfig = await Config.findOne({ key: 'smtp' });
  if (!smtpConfig) {
    throw new Error('SMTP not configured. Please configure SMTP in admin settings.');
  }
  const { host, port, user, pass, from } = smtpConfig.value;
  return {
    transporter: nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: { user, pass }
    }),
    from
  };
}

async function sendProposalEmail({ to, subject, body, pdfBuffer, proposal }) {
  const { transporter, from } = await getTransporter();
  await transporter.sendMail({
    from,
    to,
    subject: subject || `Proposal ${proposal.referenceNo} - ${proposal.clientName}`,
    html: body || `<p>Please find attached the eInvoicing Proposal for ${proposal.clientName}.</p>`,
    attachments: [{
      filename: `${proposal.referenceNo}-${proposal.clientName}-Proposal.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }]
  });
}

module.exports = { sendProposalEmail };
