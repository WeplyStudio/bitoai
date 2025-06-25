
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

// Get all projects for the logged-in user
export async function GET() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const projects = await Project.find({ userId: decoded.id }).sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// Create a new project for the logged-in user
export async function POST() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const newProject = await Project.create({
      userId: decoded.id,
      name: 'Untitled Chat',
      summary: 'A new conversation begins...'
    });
    
    // --- Achievement Logic ---
    const projectCount = await Project.countDocuments({ userId: decoded.id });
    const achievementsToGrant = [];
    if (projectCount === 1) {
        achievementsToGrant.push('first_chat');
    }
    if (projectCount === 10) {
        achievementsToGrant.push('ten_chats');
    }
    if (projectCount === 100) {
      achievementsToGrant.push('hundred_chats');
    }
    if (projectCount === 1000) {
        achievementsToGrant.push('thousand_chats');
    }
    if (projectCount === 10000) {
        achievementsToGrant.push('ten_thousand_chats');
    }
    if (projectCount === 100000) {
        achievementsToGrant.push('hundred_thousand_chats');
    }

    if (achievementsToGrant.length > 0) {
        await User.findByIdAndUpdate(decoded.id, { $addToSet: { achievements: { $each: achievementsToGrant } } });
    }
    // --- End Achievement Logic ---

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
