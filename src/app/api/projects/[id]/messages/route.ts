import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ChatMessage from '@/models/ChatMessage';

const JWT_SECRET = process.env.JWT_SECRET;

// Get all messages for a specific project
export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.');
  }

  const { id: projectId } = params;

  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = decoded.id;

    await connectDB();

    // Verify user owns the project they are requesting messages from
    const project = await Project.findOne({ _id: projectId, userId: userId });
    if (!project) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }
    
    const messages = await ChatMessage.find({ projectId: projectId }).sort({ createdAt: 'asc' });

    // Mongoose documents are not plain objects, so we convert them
    const plainMessages = messages.map(msg => {
      const obj = msg.toObject();
      return { ...obj, id: obj._id.toString() };
    });

    return NextResponse.json(plainMessages);

  } catch (error) {
    console.error(`Failed to fetch messages for project ${projectId}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}