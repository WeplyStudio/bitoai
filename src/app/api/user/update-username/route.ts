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
    const existingUserWithSameName = await User.findOne({ username: trimmedUsername, _id: { $ne: decoded.id } });
    if (existingUserWithSameName) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }
    
    // Explicitly find the user first
    const userToUpdate = await User.findById(decoded.id);
    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found. Could not update.' }, { status: 404 });
    }
    
    // Set the new username and save the document
    userToUpdate.username = trimmedUsername;
    
    // The save() method will trigger Mongoose's full validation, including checking the unique index.
    const savedUser = await userToUpdate.save();

    return NextResponse.json({ message: 'Username updated successfully.', user: { username: savedUser.username } });

  } catch (error: any) {
    console.error('Update username error:', error);
    // Handle potential duplicate key error from MongoDB that might arise from a race condition
    if (error.code === 11000) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }
    // Handle Mongoose validation errors more broadly
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message || 'Validation failed.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred while updating the username.' }, { status: 500 });
  }
}
