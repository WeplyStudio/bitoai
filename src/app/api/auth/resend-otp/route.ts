
'use server';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendOtpEmail } from '@/lib/nodemailer';

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

    // To prevent user enumeration, always return a success-like message.
    if (!user) {
      return NextResponse.json({ message: 'If an account with this email exists, a new OTP has been sent.' });
    }
    
    // Generate and set new OTP
    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // Send the new OTP
    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: 'A new OTP has been sent to your email.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
