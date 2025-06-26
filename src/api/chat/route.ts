
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

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}


export async function POST(request: Request) {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let { projectId, message, mode } = await request.json();
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
        
        // **SAFETY NETS**: Initialize fields for older accounts if they don't exist.
        if (typeof user.credits === 'undefined' || user.credits === null) user.credits = 0;
        if (!Array.isArray(user.achievements)) user.achievements = [];
        if (typeof user.creditsSpent !== 'number') user.creditsSpent = 0;
        if (typeof user.messagesToday !== 'number') user.messagesToday = 0;

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
                return NextResponse.json({ error: 'Insufficient credits. Please contact admin to buy more.' }, { status: 403 });
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
        
        const userMessage = await ChatMessage.create({
            projectId,
            userId,
            role: 'user',
            content: message.content,
            imageUrl: message.imageUrl,
        });

        // --- Achievement Logic ---
        const now = new Date();
        // Important People (10 messages in a day)
        if (user.lastMessageDate && isSameDay(now, user.lastMessageDate)) {
            user.messagesToday += 1;
        } else {
            user.messagesToday = 1;
        }
        user.lastMessageDate = now;
        if (user.messagesToday > 10 && !user.achievements.includes('important_people')) {
            achievementsToGrant.push('important_people');
        }

        // Night Owl (2-5 AM UTC)
        const hourUTC = now.getUTCHours();
        if (hourUTC >= 2 && hourUTC < 5 && !user.achievements.includes('night_owl')) {
             achievementsToGrant.push('night_owl');
        }

        // Prompt Crafter (>35 words)
        if (message.content.split(/\s+/).length > 35 && !user.achievements.includes('prompt_crafter')) {
            achievementsToGrant.push('prompt_crafter');
        }

        // Memelord
        if (message.content.toLowerCase().includes('meme') && !user.achievements.includes('memelord')) {
            achievementsToGrant.push('memelord');
        }
        // --- End Achievement Logic ---

        const recentHistory = await ChatMessage.find({ projectId }).sort({ createdAt: -1 }).limit(10);
        const historyForApi: ApiChatMessage[] = recentHistory.reverse().map(m => ({
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

        // Quick Thinker Achievement (<5 seconds)
        if (duration < 5000 && !user.achievements.includes('quick_thinker')) {
            achievementsToGrant.push('quick_thinker');
        }
        
        if (!aiResponse || !aiResponse.content) {
            throw new Error('AI did not return a response.');
        }

        const aiMessage = await ChatMessage.create({
            projectId,
            userId,
            role: 'model',
            content: aiResponse.content,
        });

        // Grant all new achievements
        if (achievementsToGrant.length > 0) {
            await User.findByIdAndUpdate(userId, { $addToSet: { achievements: { $each: achievementsToGrant } } });
        }
        await user.save();

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
        const updatedUser = await User.findById(userId).select('achievements');

        return NextResponse.json({ 
            aiMessage: { ...plainAiMessage, id: plainAiMessage._id.toString() },
            updatedProjectName,
            userCredits: user.credits,
            newAchievements: updatedUser?.achievements || user.achievements,
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
