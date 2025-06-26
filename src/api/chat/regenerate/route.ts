
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
        let { projectId, messageId, mode } = await request.json();
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

        // **SAFETY NET**: Initialize fields for older accounts if they don't exist.
        if (typeof user.credits !== 'number') user.credits = 0;
        if (!Array.isArray(user.achievements)) user.achievements = [];
        if (typeof user.creditsSpent !== 'number') user.creditsSpent = 0;

        const achievementsToGrant: string[] = [];
        let customPrompt: string | undefined = undefined;

        // --- Credit & Pro Mode Logic ---
        const proModes = ['storyteller', 'sarcastic', 'technical', 'philosopher'];
        const presetModes = ['default', 'creative', 'professional', ...proModes];
        
        if (mode && !presetModes.includes(mode)) {
            // This is a custom mode
            const customMode = user.customAiModes?.find(m => m.id === mode);
            if (customMode) {
                customPrompt = customMode.prompt;
            } else {
                mode = 'default'; // Fallback if custom mode ID is invalid
            }
        } else if (mode && proModes.includes(mode)) {
            // This is a preset Pro mode
            if (user.credits < 1) {
                return NextResponse.json({ error: 'Insufficient credits to use this feature. Please contact admin to buy more.' }, { status: 403 });
            }
            user.credits -= 1;
            user.creditsSpent += 1;

            if (!user.achievements.includes('first_pro_chat')) {
                achievementsToGrant.push('first_pro_chat');
            }
            if (user.creditsSpent >= 1000 && !user.achievements.includes('rich_people')) {
                achievementsToGrant.push('rich_people');
            }
        }
        // --- End Credit & Achievement Logic ---

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
        
        const startTime = performance.now();
        const aiResponse = await chat({
            messages: historyForApi,
            mode: mode || 'default',
            language: 'id', 
            username: user.username,
            customPrompt: customPrompt,
        });
        const duration = performance.now() - startTime;

        if (duration < 5000 && !user.achievements.includes('quick_thinker')) {
            achievementsToGrant.push('quick_thinker');
        }

        if (!aiResponse || !aiResponse.content) {
            throw new Error('AI did not return a response.');
        }

        // Grant all new achievements
        if (achievementsToGrant.length > 0) {
            await User.findByIdAndUpdate(userId, { $addToSet: { achievements: { $each: achievementsToGrant } } });
        }

        messageToRegenerate.content = aiResponse.content;
        await messageToRegenerate.save();
        await user.save();
        
        const plainAiMessage = messageToRegenerate.toObject();
        const updatedUser = await User.findById(userId).select('achievements');

        return NextResponse.json({ 
            message: { ...plainAiMessage, id: plainAiMessage._id.toString() },
            userCredits: user.credits,
            newAchievements: updatedUser?.achievements || user.achievements,
        });

    } catch (error) {
        console.error('Chat Regenerate API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
