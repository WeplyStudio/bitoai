
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import ChatMessage from '@/models/ChatMessage';
import { chat } from '@/ai/flows/chat';
import type { ChatMessage as ApiChatMessage } from '@/ai/schemas';

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

export async function POST(request: Request) {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { projectId, messageId, mode } = await request.json();
        if (!projectId || !messageId) {
            return NextResponse.json({ error: 'Project ID and Message ID are required' }, { status: 400 });
        }

        await connectDB();

        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) {
            return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
        }
        
        const messageToRegenerate = await ChatMessage.findOne({ _id: messageId, projectId });
        if (!messageToRegenerate || messageToRegenerate.role !== 'model') {
            return NextResponse.json({ error: 'Message not found or cannot be regenerated' }, { status: 404 });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (typeof user.credits !== 'number') {
            user.credits = 0;
        }

        // --- Credit Deduction Logic ---
        const proModes = ['storyteller', 'sarcastic', 'technical', 'philosopher'];
        if (mode && proModes.includes(mode)) {
            if (user.credits < 1) {
                return NextResponse.json({ error: 'Insufficient credits to use this feature. Please contact admin to buy more.' }, { status: 403 });
            }
            user.credits -= 1;
        }
        // --- End Credit Deduction Logic ---

        // Fetch chat history UP TO the message being regenerated
        const historyUpToMessage = await ChatMessage.find({ 
            projectId,
            createdAt: { $lt: messageToRegenerate.createdAt }
        }).sort({ createdAt: -1 }).limit(10); 

        const historyForApi: ApiChatMessage[] = historyUpToMessage.reverse().map(m => ({
            role: m.role as 'user' | 'model',
            content: m.content,
            imageUrl: m.imageUrl
        }));
        
        const aiResponse = await chat({
            messages: historyForApi,
            mode: mode || 'default',
            language: 'id', 
            username: user.username,
        });

        if (!aiResponse || !aiResponse.content) {
            throw new Error('AI did not return a response.');
        }

        // Update the existing AI message
        messageToRegenerate.content = aiResponse.content;
        await messageToRegenerate.save();
        await user.save(); // Save the user with decremented credits
        
        const plainAiMessage = messageToRegenerate.toObject();

        return NextResponse.json({ 
            message: { ...plainAiMessage, id: plainAiMessage._id.toString() },
            userCredits: user.credits 
        });

    } catch (error) {
        console.error('Chat Regenerate API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
