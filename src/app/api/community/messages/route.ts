import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CommunityMessage from '@/models/CommunityMessage';

export async function GET() {
  await connectDB();
  try {
    const messages = await CommunityMessage.find({}).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connectDB();
  try {
    const { content, author } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newMessage = new CommunityMessage({
      content,
      author: author || 'Anonymous',
    });

    await newMessage.save();
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to post message:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
