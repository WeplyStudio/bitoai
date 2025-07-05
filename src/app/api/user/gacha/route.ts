
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
const GACHA_COST = 10;

const prizes = [
  { prize: 250, probability: 0.0001 }, // 0.01%
  { prize: 100, probability: 0.0009 }, // 0.09%
  { prize: 50,  probability: 0.004 },  // 0.4%
  { prize: 25,  probability: 0.015 },  // 1.5%
  { prize: 10,  probability: 0.03 },   // 3%
  { prize: 5,   probability: 0.05 },   // 5%
  { prize: 3,   probability: 0.15 },   // 15%
  { prize: 1,   probability: 0.75 },   // 75%
];

function determinePrize() {
    const random = Math.random();
    let cumulativeProbability = 0;
    for (const item of prizes) {
        cumulativeProbability += item.probability;
        if (random < cumulativeProbability) {
            return item.prize;
        }
    }
    return 1; // Fallback prize
}

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

    await connectDB();
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.credits < GACHA_COST) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
        }

        // Deduct cost and determine prize
        user.credits -= GACHA_COST;
        const prizeWon = determinePrize();
        user.credits += prizeWon;

        await user.save();
        
        return NextResponse.json({ 
            prize: prizeWon, 
            newBalance: user.credits 
        });

    } catch (error) {
        console.error('Gacha API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
