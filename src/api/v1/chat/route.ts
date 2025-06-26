
'use server';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { chat } from '@/ai/flows/chat';
import type { ChatMessage as ApiChatMessage } from '@/ai/schemas';

async function authenticateAndManageCredits(authHeader: string | null): Promise<{ error?: string, status?: number, user?: any }> {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return { error: 'Authorization header with Basic scheme is required.', status: 401 };
    }

    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
        return { error: 'Invalid authentication credentials.', status: 401 };
    }

    await connectDB();
    const user = await User.findOne({ username }).select('+password +credits +apiRequestCount');

    if (!user) {
        return { error: 'Invalid username or password.', status: 401 };
    }
    
    if (!user.password) {
        return { error: 'Invalid account configuration.', status: 500 };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return { error: 'Invalid username or password.', status: 401 };
    }

    if (typeof user.apiRequestCount !== 'number') user.apiRequestCount = 0;
    if (typeof user.credits !== 'number') user.credits = 0;

    user.apiRequestCount += 1;

    if (user.apiRequestCount >= 100) {
        if (user.credits < 1) {
            return { error: 'Insufficient credits. 100 requests have been made.', status: 402 };
        }
        user.credits -= 1;
        user.apiRequestCount = 0;
    }

    await user.save();

    return { user };
}

export async function POST(request: Request) {
    const authHeader = request.headers.get('Authorization');

    try {
        const { error, status, user } = await authenticateAndManageCredits(authHeader);
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
            language: 'en',
            username: user.username,
        });
        
        if (!aiResponse || !aiResponse.content) {
            throw new Error('AI did not return a response.');
        }
        
        const requestsLeft = 100 - user.apiRequestCount;

        return NextResponse.json({ 
            response: aiResponse.content, 
            credits_remaining: user.credits,
            requests_until_next_deduction: requestsLeft
        });

    } catch (err: any) {
        console.error('[API V1 CHAT ERROR]', err);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}
