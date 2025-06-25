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

    // This is the new, more robust logic.
    // If an unverified user with this email exists, delete them to ensure we start fresh.
    // This prevents issues with malformed documents from previous failed registration attempts.
    await User.deleteOne({ email: email, isVerified: false });

    // Now, attempt to create a new user.
    // This will naturally fail if a VERIFIED user with the same email exists,
    // or if ANY user has the same username, due to unique indexes in the schema.
    // The catch block below will handle these specific duplicate errors.

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({
      email,
      username: trimmedUsername,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires,
      credits: 5,
    });

    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: 'OTP has been sent to your email. Please verify to complete registration.' }, { status: 200 });

  } catch (error: any) {
    if (error.code === 11000) {
        // Handle duplicate key errors from MongoDB's unique indexes
        if (error.keyPattern?.email) {
            return NextResponse.json({ error: 'An account with this email already exists and is verified.' }, { status: 409 });
        }
        if (error.keyPattern?.username) {
            return NextResponse.json({ error: 'This username is already taken. Please choose another one.' }, { status: 409 });
        }
        // Fallback for other potential unique index violations
        return NextResponse.json({ error: 'A user with these details already exists.' }, { status: 409 });
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
