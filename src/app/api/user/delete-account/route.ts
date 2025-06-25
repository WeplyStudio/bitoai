
'use server';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import ChatMessage from '@/models/ChatMessage';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export async function DELETE(request: Request) {
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

    const userId = decoded.id;

    await connectDB();

    // Find all projects owned by the user
    const userProjects = await Project.find({ userId }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    // Delete all chat messages associated with those projects
    if (projectIds.length > 0) {
        await ChatMessage.deleteMany({ projectId: { $in: projectIds } });
    }

    // Delete all projects owned by the user
    await Project.deleteMany({ userId });

    // Delete the user account itself
    const deletionResult = await User.findByIdAndDelete(userId);
    if (!deletionResult) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    
    // Clear the authentication cookie
    cookieStore.set('token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });

    return NextResponse.json({ message: 'Account deleted successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'An internal server error occurred while deleting the account.' }, { status: 500 });
  }
}
