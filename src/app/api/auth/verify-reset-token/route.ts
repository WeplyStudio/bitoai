'use server';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user || !user.otp || !user.otpExpires) {
      // Use a generic message to prevent leaking information about existing accounts
      return NextResponse.json({ error: 'Invalid OTP or expired code. Please try again.' }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }
    
    const isOtpMatch = await bcrypt.compare(otp, user.otp);
    if (!isOtpMatch) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
    }

    // OTP is correct, but don't consume it yet. Just return success.
    return NextResponse.json({ message: 'OTP verified successfully.' });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
