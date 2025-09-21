import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'localhost';
const port = Number(process.env.SMTP_PORT || 1025);
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const from = process.env.EMAIL_FROM || 'no-reply@example.com';

let transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: user ? { user, pass } : undefined,
});

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3025';
  const verifyUrl = `${baseUrl}/api/students/verify/${token}`;
  const html = `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a> or pasting the token into the app.</p>`;
  await transporter.sendMail({
    from,
    to,
    subject: 'Verify your email',
    html,
    text: `Verify your email using this link: ${verifyUrl}`,
  });
}
