
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

async function getAdminUser() {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  const token = cookies().get('token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    await connectDB();
    const user = await User.findById(decoded.id);
    if (user && user.role === 'admin') {
      return user;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  const { userId } = params;
  if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  try {
    const { amount } = await request.json();
    const creditsToAdd = parseInt(amount, 10);

    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid credit amount. Must be a positive number.' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: creditsToAdd } },
      { new: true }
    ).select('username email credits _id');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Credits added successfully', user: updatedUser });
  } catch (error) {
    console.error('Add credits error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
