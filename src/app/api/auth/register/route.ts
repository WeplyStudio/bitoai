import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendOtpEmail } from '@/lib/nodemailer';

// Function to generate a 6-digit OTP
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
    
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });

    // If user exists and is already verified, block registration
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (existingUser) {
      // Update existing but unverified user
      existingUser.password = hashedPassword;
      existingUser.otp = hashedOtp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      // Create new user
      await User.create({
        email,
        password: hashedPassword,
        otp: hashedOtp,
        otpExpires,
      });
    }

    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: 'OTP has been sent to your email. Please verify to complete registration.' }, { status: 200 });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
        let errors: { [key: string]: string } = {};
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message;
        });
        return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
