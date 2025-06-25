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
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();

    if (!username || username.trim().length < 3 || username.trim().length > 20) {
      return NextResponse.json({ error: 'Username must be between 3 and 20 characters.' }, { status: 400 });
    }
    
    // Basic validation to prevent users from using "admin", "support", etc.
    const forbiddenUsernames = ['admin', 'support', 'bito', 'system', 'root'];
    if (forbiddenUsernames.includes(username.toLowerCase())) {
        return NextResponse.json({ error: 'This username is not allowed.' }, { status: 400 });
    }

    await connectDB();
    
    // Check if the username is already taken by another user
    const existingUser = await User.findOne({ username, _id: { $ne: decoded.id } });
    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }

    await User.findByIdAndUpdate(decoded.id, { username });

    return NextResponse.json({ message: 'Username updated successfully.' });
  } catch (error) {
    console.error('Update username error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
