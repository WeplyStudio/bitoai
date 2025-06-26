
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
        await connectDB();
        const { modeId } = await request.json();

        if (!modeId) {
            return NextResponse.json({ error: 'Mode ID is required.' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { customAiModes: { id: modeId } } },
            { new: true }
        ).select('customAiModes');


        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Custom AI mode deleted successfully!', 
            customAiModes: updatedUser.customAiModes 
        }, { status: 200 });

    } catch (error) {
        console.error('Delete AI Mode API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}
