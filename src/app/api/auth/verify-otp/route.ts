
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Explicitly select all fields needed for patching and the response.
    const user = await User.findOne({ email }).select('+otp +otpExpires username credits role');

    if (!user || !user.otp || !user.otpExpires) {
      return NextResponse.json({ error: 'Invalid request. Please try logging in again.' }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
      return NextResponse.json({ error: 'OTP has expired. Please try again.' }, { status: 400 });
    }
    
    const isOtpMatch = await bcrypt.compare(otp, user.otp);
    if (!isOtpMatch) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
    }

    // OTP is correct, clear it and mark user as verified
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;

    // *** GUARANTEED PATCH FOR EXISTING ACCOUNTS ***
    // If an older account is missing the credits field, this initializes it.
    if (typeof user.credits !== 'number') {
      user.credits = 5;
    }
    
    await user.save();
    
    // Generate JWT and log the user in
    const tokenPayload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Return the fresh, patched user data
    return NextResponse.json({ 
      id: user._id,
      email: user.email,
      username: user.username,
      credits: user.credits,
      role: user.role,
    });
  } catch (error) {
    console.error('OTP Verification error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
