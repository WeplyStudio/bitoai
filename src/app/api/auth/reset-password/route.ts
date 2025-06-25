'use server';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, otp, password } = await request.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user || !user.otp || !user.otpExpires) {
      return NextResponse.json({ error: 'Invalid request or expired code. Please try again.' }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }
    
    const isOtpMatch = await bcrypt.compare(otp, user.otp);
    if (!isOtpMatch) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
    }

    // OTP is correct, update password and clear OTP fields
    user.password = await bcrypt.hash(password, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true; // Also verify the user if they reset password
    await user.save();

    return NextResponse.json({ message: 'Password has been reset successfully. You can now log in.' });

  } catch (error) {
    console.error('Reset Password error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
