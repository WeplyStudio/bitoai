
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET;
const MODE_CREATION_COST = 150;

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
        await connectDB();
        const { name, prompt } = await request.json();

        if (!name || !prompt || name.trim().length === 0 || prompt.trim().length === 0) {
            return NextResponse.json({ error: 'Name and prompt are required.' }, { status: 400 });
        }

        const newMode = {
            id: `custom-${new mongoose.Types.ObjectId().toString()}`,
            name: name.trim(),
            prompt: prompt.trim(),
        };

        // Use a single, atomic findOneAndUpdate operation.
        // This is safer than find-then-save, as it prevents race conditions.
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, credits: { $gte: MODE_CREATION_COST } }, // Condition: Find user with enough credits
            {
                $push: { customAiModes: newMode },
                $inc: { credits: -MODE_CREATION_COST }
            },
            { new: true } // Option to return the document after the update
        );
        
        // If updatedUser is null, it means the condition was not met (user not found or insufficient credits).
        if (!updatedUser) {
            // To provide a specific error message, we check why it failed.
            const user = await User.findById(userId).select('credits');
            if (!user) {
                return NextResponse.json({ error: 'User not found.' }, { status: 404 });
            }
            if (user.credits < MODE_CREATION_COST) {
                 return NextResponse.json({ error: `Insufficient credits. You need ${MODE_CREATION_COST} credits to create a mode.` }, { status: 403 });
            }
            // Fallback for other potential issues
            throw new Error("Failed to create custom mode for an unknown reason.");
        }

        const responseUser = {
            username: updatedUser.username,
            email: updatedUser.email,
            credits: updatedUser.credits,
            role: updatedUser.role,
            achievements: updatedUser.achievements,
            customAiModes: updatedUser.customAiModes,
        };

        return NextResponse.json({ 
            message: 'Custom AI mode created successfully!', 
            user: responseUser
        }, { status: 201 });

    } catch (error) {
        console.error('Create AI Mode API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}
