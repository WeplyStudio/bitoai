
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken(): Promise<string | null> {
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined.');
    try {
        const token = cookies().get('token')?.value;
        if (!token) return null;
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        return decoded.id;
    } catch (error) {
        return null;
    }
}

export async function PUT(request: Request, { params }: { params: { messageId: string } }) {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = params;
    const { content } = await request.json();

    if (!messageId || typeof content !== 'string' || content.trim() === '') {
        return NextResponse.json({ error: 'Message ID and content are required' }, { status: 400 });
    }

    await connectDB();

    try {
        const message = await ChatMessage.findById(messageId);

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        if (message.userId.toString() !== userId) {
            return NextResponse.json({ error: 'Forbidden: You can only edit your own messages' }, { status: 403 });
        }
        
        if (message.role !== 'user') {
            return NextResponse.json({ error: 'Forbidden: Cannot edit AI-generated messages' }, { status: 403 });
        }

        message.content = content.trim();
        await message.save();

        const plainMessage = message.toObject();

        return NextResponse.json({ 
            message: { ...plainMessage, id: plainMessage._id.toString() }
        });

    } catch (error) {
        console.error(`Error updating message ${messageId}:`, error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
