
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import ChatMessage from '@/models/ChatMessage';
import { chat } from '@/ai/flows/chat';
import { renameProject } from '@/ai/flows/rename-project-flow';
import type { ChatMessage as ApiChatMessage } from '@/ai/schemas';

const JWT_SECRET = process.env.JWT_SECRET;

const EXP_PER_MESSAGE = 5;
const COINS_PER_MESSAGE = 3;

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
        const { projectId, message, mode } = await request.json();
        if (!projectId || !message || !message.content) {
            return NextResponse.json({ error: 'Project ID and message content are required' }, { status: 400 });
        }

        await connectDB();

        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) {
            return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // --- Safety Net for Gamification Fields ---
        if (typeof user.level !== 'number') user.level = 1;
        if (typeof user.exp !== 'number') user.exp = 0;
        if (typeof user.coins !== 'number') user.coins = 0;
        if (typeof user.nextLevelExp !== 'number') user.nextLevelExp = 50;
        // --- End Safety Net ---

        // --- Gamification & Credit Logic ---
        user.exp += EXP_PER_MESSAGE;
        user.coins += COINS_PER_MESSAGE;

        let leveledUp = false;
        if (user.exp >= user.nextLevelExp) {
            leveledUp = true;
            user.level += 1;
            user.exp -= user.nextLevelExp;
            // Exponential scaling for next level's EXP requirement
            user.nextLevelExp = Math.floor(50 * Math.pow(1.85, user.level - 1));
        }

        const proModes = ['storyteller', 'sarcastic', 'technical', 'philosopher'];
        if (mode && proModes.includes(mode)) {
            if (user.credits < 1) {
                return NextResponse.json({ error: 'Insufficient credits. Please contact admin to buy more.' }, { status: 403 });
            }
            user.credits -= 1;
        }
        // --- End Gamification & Credit Logic ---

        // Create user message WITH detailed logging
        const userMessage = await ChatMessage.create({
            projectId,
            userId,
            role: 'user',
            content: message.content,
            imageUrl: message.imageUrl,
            expEarned: EXP_PER_MESSAGE,
            coinsEarned: COINS_PER_MESSAGE,
        });

        const recentHistory = await ChatMessage.find({ projectId }).sort({ createdAt: -1 }).limit(10);
        const historyForApi: ApiChatMessage[] = recentHistory.reverse().map(m => ({
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

        const aiMessage = await ChatMessage.create({
            projectId,
            userId,
            role: 'model',
            content: aiResponse.content,
        });
        
        await user.save(); // Save user with updated stats

        let updatedProjectName = null;
        const messageCount = await ChatMessage.countDocuments({ projectId });
        if (messageCount <= 2 && project.name === 'Untitled Chat') {
            const fullHistory = await ChatMessage.find({ projectId }).sort({ createdAt: 'asc' });
            const chatHistoryText = fullHistory.map(m => `${m.role}: ${m.content}`).join('\n');
            const renameResult = await renameProject({ chatHistory: chatHistoryText, language: 'id' });
            if (renameResult && renameResult.projectName) {
                project.name = renameResult.projectName;
                await project.save();
                updatedProjectName = project.name;
            }
        }
        
        const plainUserMessage = userMessage.toObject();
        const plainAiMessage = aiMessage.toObject();

        return NextResponse.json({
            userMessage: { ...plainUserMessage, id: plainUserMessage._id.toString() },
            aiMessage: { ...plainAiMessage, id: plainAiMessage._id.toString() },
            updatedProjectName,
            leveledUp,
            updatedUser: {
                level: user.level,
                exp: user.exp,
                nextLevelExp: user.nextLevelExp,
                coins: user.coins,
                credits: user.credits,
            }
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
