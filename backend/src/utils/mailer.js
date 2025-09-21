const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendMail(to, subject, text, html) {
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    html
  });
  return info;
}

module.exports = { sendMail };
