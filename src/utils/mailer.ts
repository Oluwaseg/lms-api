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

// function buildVerifyUrl(baseUrl: string, role: string, token: string) {
//   return `${baseUrl}/api/${role}s/verify-email?token=${encodeURIComponent(
//     token
//   )}`;
// }

function buildFrontendVerifyUrl(baseUrl: string, role: string, token: string) {
  return `${baseUrl}/${role}s/verify?token=${encodeURIComponent(token)}`;
}

export async function sendStudentVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3025';
  const verifyUrl = buildFrontendVerifyUrl(baseUrl, 'student', token);
  const subject = `Verify your Student account`;
  const html = `
    <p>Hi,</p>
    <p>Please verify your student account by clicking <a href="${verifyUrl}">this link</a> or pasting the token into the app.</p>
    <p>If the link doesn't work, use this token: <code>${token}</code></p>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: `Verify your student account using this link: ${verifyUrl} (token: ${token})`,
  });
}

export async function sendParentVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3025';
  const verifyUrl = buildFrontendVerifyUrl(baseUrl, 'parent', token);
  const subject = `Verify your Parent account`;
  const html = `
    <p>Hi,</p>
    <p>Please verify your parent account by clicking <a href="${verifyUrl}">this link</a> or pasting the token into the app.</p>
    <p>If the link doesn't work, use this token: <code>${token}</code></p>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: `Verify your parent account using this link: ${verifyUrl} (token: ${token})`,
  });
}

export async function sendInstructorVerificationEmail(
  to: string,
  token: string
) {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3025';
  const verifyUrl = buildFrontendVerifyUrl(baseUrl, 'instructor', token);
  const subject = `Verify your Instructor account`;
  const html = `
    <p>Hi,</p>
    <p>Please verify your instructor account by clicking <a href="${verifyUrl}">this link</a> or pasting the token into the app.</p>
    <p>If the link doesn't work, use this token: <code>${token}</code></p>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: `Verify your instructor account using this link: ${verifyUrl} (token: ${token})`,
  });
}

// Backwards-compatible alias for callers that still use the combined name.
export const sendVerificationEmail = sendStudentVerificationEmail;

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
