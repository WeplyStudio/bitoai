import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ChatMessage from '@/models/ChatMessage';

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken(): Promise<string | null> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.');
  }
  try {
    const token = cookies().get('token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// Update a project
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  try {
    const { name, summary } = await request.json();
    const updateData: { name?: string, summary?: string } = {};
    if (name) updateData.name = name;
    if (summary) updateData.summary = summary;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    await connectDB();
    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, userId: userId }, // Ensure user owns the project
      updateData,
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(`Failed to update project ${id}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// Delete a project
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  try {
    await connectDB();
    
    // Find the project to ensure it belongs to the user
    const project = await Project.findOne({ _id: id, userId: userId });
    if (!project) {
        return NextResponse.json({ error: 'Project not found or not owned by user' }, { status: 404 });
    }

    // Delete all associated messages first
    await ChatMessage.deleteMany({ projectId: id });

    // Then delete the project itself
    await Project.deleteOne({ _id: id });

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete project ${id}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}