
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
    
    // Step 1: Find the user document first. This is a more stable approach.
    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Step 2: Generate the new key and its hash.
    const apiKey = `bito_${randomBytes(16).toString('hex')}`;
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

    // Step 3: Assign the new hash and save the document.
    // The .save() method provides more reliable error handling than findByIdAndUpdate in this context.
    user.apiKeyHash = apiKeyHash;
    await user.save();

    // Step 4: Return the new, unhashed API key to the user.
    return NextResponse.json({ apiKey });

  } catch (error: any) {
    console.error('API key generation error:', error);
    // This catch block is now more robust. It handles the specific duplicate key error (11000)
    // from Mongoose, which can happen in the astronomically rare case of a hash collision.
    if (error.code === 11000) {
        return NextResponse.json({ error: 'An unexpected error occurred. Please try generating the key again.' }, { status: 500 });
    }
    // For all other errors, return a generic server error.
    return NextResponse.json({ error: 'An internal server error occurred while generating the API key.' }, { status: 500 });
  }
}
