
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

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        if (user.credits < MODE_CREATION_COST) {
            return NextResponse.json({ error: `Insufficient credits. You need ${MODE_CREATION_COST} credits to create a mode.` }, { status: 403 });
        }
        
        // Defensive check: Initialize the array if it doesn't exist on older documents.
        if (!Array.isArray(user.customAiModes)) {
            user.customAiModes = [];
        }

        const newMode = {
            id: `custom-${new mongoose.Types.ObjectId().toString()}`,
            name: name.trim(),
            prompt: prompt.trim(),
        };
        
        user.customAiModes.push(newMode);
        user.credits -= MODE_CREATION_COST;

        const updatedUser = await user.save();

        if (!updatedUser) {
            throw new Error("Failed to save user updates.");
        }
        
        // Construct a plain JS object for the response to ensure no Mongoose-specific properties are sent.
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
