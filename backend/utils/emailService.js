import nodemailer from 'nodemailer';

// Configuração do transporte (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'santosnath433@gmail.com',
    pass: 'oqeqtbfdlpeyyoky',
  },
});

// Função para enviar e-mail
export async function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: 'Sistema SENAI <santosnath433@gmail.com>',
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}
