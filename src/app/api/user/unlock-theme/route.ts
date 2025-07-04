
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
const THEME_COST = 150;

const validThemes = ['kawaii', 'hacker', 'retro', 'cyberpunk'];

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

    const { themeName } = await request.json();
    if (!themeName || !validThemes.includes(themeName)) {
        return NextResponse.json({ error: 'Invalid theme name provided.' }, { status: 400 });
    }

    await connectDB();
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        if (user.unlockedThemes.includes(themeName)) {
            return NextResponse.json({ error: 'Theme already unlocked.' }, { status: 400 });
        }

        if (user.credits < THEME_COST) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
        }

        user.credits -= THEME_COST;
        user.unlockedThemes.push(themeName);

        await user.save();
        
        return NextResponse.json({ 
            message: 'Theme unlocked successfully!',
            unlockedThemes: user.unlockedThemes,
            newBalance: user.credits
        });

    } catch (error) {
        console.error('Unlock Theme API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
