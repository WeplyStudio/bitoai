
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
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    const apiKey = `bito_${randomBytes(16).toString('hex')}`;
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { apiKeyHash: apiKeyHash } },
      { new: true }
    );

    if (!updatedUser) {
        return NextResponse.json({ error: 'User not found during update.' }, { status: 404 });
    }

    return NextResponse.json({ apiKey });

  } catch (error: any) {
    console.error('API key generation error:', error);
    if (error.code === 11000) {
        return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
