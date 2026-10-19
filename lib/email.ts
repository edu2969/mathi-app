import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
  baseUrl: string;
}

export async function sendVerificationEmail({
  to,
  name,
  token,
  baseUrl,
}: SendVerificationEmailParams): Promise<void> {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta - MathiApp</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f0fdf4; color:#0f3f35;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/logo.png" alt="MathiApp" width="120" style="display:block; border-radius:12px; box-shadow:0 4px 12px rgba(15,63,53,0.15);" />
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 8px 24px rgba(15,63,53,0.12);">
          <tr>
            <td align="center" style="padding:40px 32px 32px; background:linear-gradient(135deg, #0f3f35 0%, #10b981 100%);">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:-0.5px;">¡Hola, ${name}! 👋</h1>
              <p style="margin:12px 0 0; color:#d1fae5; font-size:16px; font-weight:400;">Bienvenido a MathiApp</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px;">
              <p style="margin:0 0 24px; font-size:16px; line-height:1.6; color:#0f3f35;">Para terminar de crear tu cuenta, confirma tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>
              <a href="${verifyUrl}" style="display:inline-block; background:#10b981; color:#ffffff; text-decoration:none; padding:16px 32px; border-radius:12px; font-size:16px; font-weight:700; box-shadow:0 4px 14px rgba(16,185,129,0.35); transition:background 0.2s;">Confirmar mi correo</a>
              <p style="margin:24px 0 0; font-size:14px; line-height:1.6; color:#475569;">Si no creaste esta cuenta, puedes ignorar este mensaje con seguridad.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 32px 40px; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                Este enlace expirará en <strong>24 horas</strong>.<br>
                © ${new Date().getFullYear()} MathiApp — La inteligencia que sostiene al mundo
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"MathiApp" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "Confirma tu cuenta de MathiApp ✨",
    html,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido a MathiApp!</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f0fdf4; color:#0f3f35;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/logo.png" alt="MathiApp" width="120" style="display:block; border-radius:12px; box-shadow:0 4px 12px rgba(15,63,53,0.15);" />
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 8px 24px rgba(15,63,53,0.12);">
          <tr>
            <td align="center" style="padding:40px 32px 32px; background:linear-gradient(135deg, #0f3f35 0%, #10b981 100%);">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:-0.5px;">¡Cuenta verificada! ✅</h1>
              <p style="margin:12px 0 0; color:#d1fae5; font-size:16px;">Hola, ${name}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px;">
              <p style="margin:0 0 24px; font-size:16px; line-height:1.6; color:#0f3f35;">Tu cuenta de MathiApp está lista. ¡Comienza a aprender matemáticas de forma divertida!</p>
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/levels" style="display:inline-block; background:#10b981; color:#ffffff; text-decoration:none; padding:16px 32px; border-radius:12px; font-size:16px; font-weight:700; box-shadow:0 4px 14px rgba(16,185,129,0.35);">Ir a los niveles</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 32px 40px; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                © ${new Date().getFullYear()} MathiApp — La inteligencia que sostiene al mundo
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"MathiApp" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "¡Tu cuenta de MathiApp está lista! 🎉",
    html,
  });
}
