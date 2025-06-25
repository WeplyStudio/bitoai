'use server';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendOtpEmail } from '@/lib/nodemailer';
import bcrypt from 'bcryptjs';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Still return a success message to prevent user enumeration attacks
      return NextResponse.json({ message: 'If an account with this email exists, a reset code has been sent.' });
    }

    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: 'A password reset code has been sent to your email.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    // Avoid leaking detailed error info
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
