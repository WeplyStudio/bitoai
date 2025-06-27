
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';

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

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const users = await User.find({}).select('username email credits _id role status createdAt').sort({ createdAt: -1 });

    const projectsCount = await Project.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);

    const projectsCountMap = new Map(projectsCount.map(item => [item._id.toString(), item.count]));

    const usersWithDetails = users.map(user => {
        const userObj = user.toObject();
        return {
            ...userObj,
            projectCount: projectsCountMap.get(user._id.toString()) || 0
        };
    });

    return NextResponse.json(usersWithDetails);
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
