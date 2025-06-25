
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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
        const { achievementId } = await request.json();
        if (!achievementId) {
            return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
        }

        await connectDB();
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { achievements: achievementId } },
            { new: true }
        ).select('achievements');

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ newAchievements: updatedUser.achievements });

    } catch (error) {
        console.error('Grant Achievement API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
