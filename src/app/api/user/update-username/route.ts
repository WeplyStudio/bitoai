'use server';

import { NextResponse } from 'next/server';
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
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }

    const { username } = await request.json();
    const trimmedUsername = username.trim();

    if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return NextResponse.json({ error: 'Username must be between 3 and 20 characters.' }, { status: 400 });
    }
    
    const forbiddenUsernames = ['admin', 'support', 'bito', 'system', 'root', 'anonymous'];
    if (forbiddenUsernames.includes(trimmedUsername.toLowerCase())) {
        return NextResponse.json({ error: 'This username is not allowed.' }, { status: 400 });
    }

    await connectDB();
    
    // Check if the username is already taken by another user
    const existingUser = await User.findOne({ username: trimmedUsername, _id: { $ne: decoded.id } });
    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id, 
      { username: trimmedUsername },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
        return NextResponse.json({ error: 'User not found. Update failed.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Username updated successfully.', user: { username: updatedUser.username } });
  } catch (error) {
    console.error('Update username error:', error);
    // Handle potential duplicate key error from MongoDB if the unique check fails due to a race condition
    if ((error as any).code === 11000) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
