
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

async function getAuthenticatedUser() {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  const token = cookies().get('token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    await connectDB();
    const user = await User.findById(decoded.id);
    return user;
  } catch (error) {
    return null;
  }
}

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found or invalid token.' }, { status: 401 });
  }

  try {
    // Generate a new API key
    const apiKey = `bito_${randomBytes(16).toString('hex')}`;
    
    // Hash the API key for storage
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

    // Update the user's document with the new hashed API key
    user.apiKeyHash = apiKeyHash;
    await user.save();

    // Return the plain API key to the user (this is the only time it will be shown)
    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
