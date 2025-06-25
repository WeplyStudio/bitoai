'use server';

import { NextResponse } from 'next/server';
import { chat } from '@/ai/flows/chat';
import type { ChatMessage as ApiChatMessage } from '@/ai/schemas';

export async function POST(request: Request) {
    try {
        const { messages, mode } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages are required and must be an array' }, { status: 400 });
        }

        const recentHistory: ApiChatMessage[] = messages.slice(-10);

        const aiResponse = await chat({
            messages: recentHistory,
            mode: mode || 'default',
            language: 'id',
        });
        
        if (!aiResponse || !aiResponse.content) {
            throw new Error('AI did not return a response.');
        }
        
        const aiMessage = {
            id: `model-${Date.now()}`,
            role: 'model',
            content: aiResponse.content,
        };

        return NextResponse.json({ aiMessage });

    } catch (error) {
        console.error('Guest Chat API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
