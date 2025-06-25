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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password!);
    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // The check for verified users is removed.
    // Both verified and unverified users will now proceed to OTP verification.
    // The verification logic in /verify-otp will handle setting isVerified to true.

    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: 'OTP sent to your email for verification.' });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
