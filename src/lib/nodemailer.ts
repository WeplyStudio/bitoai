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
