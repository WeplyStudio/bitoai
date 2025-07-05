import nodemailer from 'nodemailer';

const ZOHO_EMAIL = process.env.ZOHO_EMAIL;
const ZOHO_APP_PASSWORD = process.env.ZOHO_APP_PASSWORD;

if (!ZOHO_EMAIL || !ZOHO_APP_PASSWORD) {
  console.warn(
    'Zoho email credentials are not set in .env. Email sending will be disabled.'
  );
}

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: ZOHO_EMAIL,
    pass: ZOHO_APP_PASSWORD,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  if (!ZOHO_EMAIL || !ZOHO_APP_PASSWORD) {
    throw new Error('Email service is not configured.');
  }

  const mailOptions = {
    from: `"Bito AI" <${ZOHO_EMAIL}>`,
    to: to,
    subject: 'Your Bito AI Verification Code',
    html: `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Kode OTP Anda – Bito AI</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f9fafb; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">

          <!-- Card Container -->
          <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 48px; box-shadow: 0 10px 35px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                                  
                <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">Verifikasi Email Anda</h1>
              </td>
            </tr>

            <tr>
              <td style="font-size: 16px; color: #374151; padding-bottom: 32px; text-align: center;">
                Hai 👋, kamu sedang mencoba masuk atau membuat akun di <span style="color:#2563eb; font-weight:600;">Bito AI</span>.<br/>
                Masukkan kode berikut untuk melanjutkan:
              </td>
            </tr>

            <!-- OTP Code -->
            <tr>
              <td align="center">
                <div style="
                  display: inline-block;
                  font-size: 40px;
                  font-weight: 700;
                  letter-spacing: 18px;
                  color: #111827;
                  background-color: #f3f4f6;
                  padding: 20px 32px;
                  border-radius: 14px;
                  border: 1px solid #d1d5db;
                  width: fit-content;
                ">
                  ${otp}
                </div>
              </td>
            </tr>

            <!-- Validity Notice -->
            <tr>
              <td style="font-size: 14px; color: #6b7280; padding-top: 24px; text-align: center;">
                Kode ini akan kadaluarsa dalam <strong>10 menit</strong>. Demi keamanan akun Anda, jangan bagikan kode ini kepada siapa pun.
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding-top: 48px;">
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 auto; width: 100%;" />
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="font-size: 12px; color: #9ca3af; text-align: center; padding-top: 32px;">
                Tidak merasa melakukan permintaan ini? Abaikan saja email ini.<br/>
                &copy; 2025 Bito AI. Dibuat dengan 💡 dan kopi di Indonesia.
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>

  </body>
</html>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send verification email. Please try again later.');
  }
};

export const sendWelcomeEmail = async (to: string, username: string) => {
  if (!ZOHO_EMAIL || !ZOHO_APP_PASSWORD) {
    console.log('Welcome email skipped: Email service is not configured.');
    return;
  }

  const mailOptions = {
    from: `"Bito AI" <${ZOHO_EMAIL}>`,
    to: to,
    subject: 'Welcome to Bito AI!',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #2c3e50;">Welcome to Bito AI, ${username}!</h2>
        <p>Thank you for registering and verifying your account. We're thrilled to have you on board.</p>
        <p>You have been granted <strong>5 free credits</strong> to start exploring our Pro AI modes.</p>
        <p>Here are a few things you can do to get started:</p>
        <ul>
          <li>Start a new chat and ask Bito AI anything.</li>
          <li>Explore our prompt templates for inspiration.</li>
          <li>Check out the Settings page to customize your experience.</li>
        </ul>
        <p>If you have any questions, feel free to visit our Help & Support section in the app.</p>
        <p>Happy creating!</p>
        <br>
        <p>Best regards,<br>The JDev Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw an error to the user, just log it. This is not a critical failure.
  }
};
