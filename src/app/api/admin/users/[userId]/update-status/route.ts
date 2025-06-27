
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

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
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  const { userId } = params;
  if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }
  
  if (adminUser._id.toString() === userId) {
      return NextResponse.json({ error: 'Admins cannot change their own status.' }, { status: 403 });
  }

  try {
    const { status } = await request.json();

    if (!status || !['active', 'banned'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
    }
    
    const isBlocked = status === 'banned';

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    userToUpdate.blocked = isBlocked;
    await userToUpdate.save();

    const finalUser = await User.findById(userId).select('username email credits _id role blocked createdAt').lean();

    if (!finalUser) {
        return NextResponse.json({ error: 'Failed to retrieve user after update.' }, { status: 500 });
    }
    
    const projectCount = await mongoose.model('Project').countDocuments({ userId: finalUser._id });
    const { blocked, ...userObj } = finalUser;
    const userWithDetails = { 
        ...userObj, 
        projectCount,
        status: blocked ? 'banned' : 'active'
    };

    return NextResponse.json({ message: 'Status updated successfully', user: userWithDetails });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
