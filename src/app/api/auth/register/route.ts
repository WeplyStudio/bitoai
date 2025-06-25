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
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Email, username, and password are required' }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
        return NextResponse.json({ error: 'Username must be between 3 and 20 characters.' }, { status: 400 });
    }
    if (/\s/.test(trimmedUsername)) {
        return NextResponse.json({ error: 'Username cannot contain spaces.' }, { status: 400 });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail && existingUserByEmail.isVerified) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    
    const existingUserByUsername = await User.findOne({ username: trimmedUsername });
    if (existingUserByUsername) {
        return NextResponse.json({ error: 'This username is already taken. Please choose another one.' }, { status: 409 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (existingUserByEmail) {
      // Update existing but unverified user if they try to re-register
      existingUserByEmail.password = hashedPassword;
      existingUserByEmail.username = trimmedUsername;
      existingUserByEmail.otp = hashedOtp;
      existingUserByEmail.otpExpires = otpExpires;
      await existingUserByEmail.save();
    } else {
      // Create new user
      await User.create({
        email,
        username: trimmedUsername,
        password: hashedPassword,
        otp: hashedOtp,
        otpExpires,
      });
    }

    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: 'OTP has been sent to your email. Please verify to complete registration.' }, { status: 200 });

  } catch (error: any) {
    if (error.code === 11000) {
        if (error.keyPattern?.email) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }
        if (error.keyPattern?.username) {
            return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 });
        }
    }
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
