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
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Bito AI Verification</h2>
        <p>Your one-time password (OTP) is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send verification email. Please try again later.');
  }
};
