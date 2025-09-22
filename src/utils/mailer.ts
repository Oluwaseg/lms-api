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

export async function sendInviteEmail(
  to: string,
  token: string,
  opts?: { recipientName?: string; parentName?: string; expiresHours?: number }
) {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3025';
  const inviteUrl = `${baseUrl}/invite/complete?token=${token}`;
  const expiresHours = opts?.expiresHours ?? 24;
  const recipient = opts?.recipientName ? `${opts.recipientName}` : 'You';
  const parent = opts?.parentName ? ` from ${opts.parentName}` : '';

  const html = `
    <p>Hi ${recipient},</p>
    <p>You have been invited${parent} to join. Click <a href="${inviteUrl}">this link</a> to accept the invite and set your password.</p>
    <p>The link expires in ${expiresHours} hours.</p>
    <p>If the button doesn't work, paste this token into the app: <code>${token}</code></p>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: 'You have been invited',
    html,
    text: `Accept invitation: ${inviteUrl} (token: ${token})`,
  });
}
