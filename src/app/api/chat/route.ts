
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

        // 1. Verify user owns the project
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) {
            return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // **SAFETY NET**: If an old user account has no credits field, initialize it to 0.
        // The main fix is in verify-otp, this is a fallback.
        if (typeof user.credits === 'undefined' || user.credits === null) {
            user.credits = 0;
        }

        // --- Credit Deduction Logic ---
        const proModes = ['storyteller', 'sarcastic', 'technical', 'philosopher'];
        if (mode && proModes.includes(mode)) {
            if (user.credits < 1) {
                return NextResponse.json({ error: 'Insufficient credits. Please contact admin to buy more.' }, { status: 403 });
            }
            user.credits -= 1;
        }
        // --- End Credit Deduction Logic ---

        // 2. Save the user's message
        const userMessage = await ChatMessage.create({
            projectId,
            userId,
            role: 'user',
            content: message.content,
            imageUrl: message.imageUrl,
        });

        // 3. Fetch recent chat history for the AI
        const recentHistory = await ChatMessage.find({ projectId }).sort({ createdAt: -1 }).limit(10);
        const historyForApi: ApiChatMessage[] = recentHistory.reverse().map(m => ({
            role: m.role as 'user' | 'model',
            content: m.content,
            imageUrl: m.imageUrl
        }));

        // 4. Call the Genkit chat flow
        const aiResponse = await chat({
            messages: historyForApi,
            mode: mode || 'default',
            language: 'id',
            username: user.username,
        });
        
        if (!aiResponse || !aiResponse.content) {
            throw new Error('AI did not return a response.');
        }

        // 5. Save the AI's response
        const aiMessage = await ChatMessage.create({
            projectId,
            userId, // Attributing to the user who initiated the chat
            role: 'model',
            content: aiResponse.content,
        });
        
        // Also save user to commit credit deduction
        await user.save();

        // 6. Check if project needs renaming (first user message)
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
        
        const plainAiMessage = aiMessage.toObject();

        return NextResponse.json({ 
            aiMessage: { ...plainAiMessage, id: plainAiMessage._id.toString() },
            updatedProjectName,
            userCredits: user.credits,
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
