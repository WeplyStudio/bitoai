
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken(): Promise<string | null> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return null;
  }
  const token = cookies().get('token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function POST() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const apiKey = `bito_${randomBytes(16).toString('hex')}`;
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

    // This is a single, atomic database operation which is much safer and prevents crashes.
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { apiKeyHash: apiKeyHash } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found. Could not generate API key.' }, { status: 404 });
    }
    
    // If the update is successful, return the new key.
    return NextResponse.json({ apiKey });

  } catch (error: any) {
    console.error('API key generation error:', error);
    // This robust catch block will handle any unexpected database errors gracefully
    // without crashing the server.
    if (error.code === 11000) {
        return NextResponse.json({ error: 'An unexpected error occurred. Please try generating the key again.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An internal server error occurred while generating the API key.' }, { status: 500 });
  }
}
