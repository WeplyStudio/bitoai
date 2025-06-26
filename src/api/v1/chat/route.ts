
'use server';

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import ChatMessage from '@/models/ChatMessage';
import { chat } from '@/ai/flows/chat';
import type { ChatMessage as ApiChatMessage } from '@/ai/schemas';

async function authenticateAndDeductCredit(apiKey: string): Promise<any> {
    if (!apiKey) return { error: 'API Key is required.', status: 401 };

    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

    await connectDB();
    const user = await User.findOne({ apiKeyHash });

    if (!user) {
        return { error: 'Invalid API Key.', status: 401 };
    }

    if (user.credits < 1) {
        return { error: 'Insufficient credits.', status: 402 };
    }

    // Deduct one credit for the API call
    user.credits -= 1;
    await user.save();

    return { user };
}

export async function POST(request: Request) {
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader?.split(' ')[1];

    try {
        const { error, status, user } = await authenticateAndDeductCredit(apiKey || '');
        if (error) {
            return NextResponse.json({ error }, { status });
        }

        const { message, mode } = await request.json();
        if (!message) {
            return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
        }
        
        const historyForApi: ApiChatMessage[] = [{
            role: 'user',
            content: message
        }];
        
        const aiResponse = await chat({
            messages: historyForApi,
            mode: mode || 'default',
            language: 'en', // API defaults to English
            username: user.username,
        });
        
        if (!aiResponse || !aiResponse.content) {
            throw new Error('AI did not return a response.');
        }

        return NextResponse.json({ response: aiResponse.content });

    } catch (err: any) {
        console.error('[API V1 CHAT ERROR]', err);
        if (err.name === 'JsonWebTokenError') {
             return NextResponse.json({ error: 'Invalid API Key format.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}
