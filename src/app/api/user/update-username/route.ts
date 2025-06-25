
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
    
    // 1. Explicitly check if the username is already taken by ANOTHER user
    const existingUserWithSameName = await User.findOne({ 
        username: trimmedUsername, 
        _id: { $ne: decoded.id } 
    });
    if (existingUserWithSameName) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }
    
    // 2. Use findByIdAndUpdate for a more robust, atomic update operation.
    const updatedUser = await User.findByIdAndUpdate(
        decoded.id,
        { $set: { username: trimmedUsername } },
        // Options:
        // - new: true -> returns the document AFTER the update is applied.
        // - runValidators: true -> ensures Mongoose schema validations (e.g., minlength) are run.
        { new: true, runValidators: true }
    );
    
    // 3. Explicitly verify that the update was successful.
    if (!updatedUser) {
        return NextResponse.json({ error: 'User not found. Could not perform update.' }, { status: 404 });
    }

    // 4. Sanity check to ensure the returned username matches what we tried to set.
    if (updatedUser.username !== trimmedUsername) {
        return NextResponse.json({ error: 'An unexpected error occurred and the username was not updated.'}, { status: 500 });
    }

    return NextResponse.json({ message: 'Username updated successfully.', user: { username: updatedUser.username } });

  } catch (error: any) {
    console.error('Update username error:', error);
    if (error.code === 11000) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message || 'Validation failed.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred while updating the username.' }, { status: 500 });
  }
}
