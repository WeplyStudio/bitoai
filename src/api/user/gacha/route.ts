
'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
const GACHA_COST = 50; // Cost in Coins

// Prizes: EXP or Coins
const prizes = [
  // EXP Prizes
  { type: 'exp', value: 250, probability: 0.005 }, // 0.5%
  { type: 'exp', value: 100, probability: 0.02 },  // 2%
  { type: 'exp', value: 50,  probability: 0.05 },  // 5%
  { type: 'exp', value: 25,  probability: 0.10 },  // 10%
  { type: 'exp', value: 5,   probability: 0.225 }, // 22.5%
  
  // Coin Prizes
  { type: 'coins', value: 100, probability: 0.01 },  // 1%
  { type: 'coins', value: 75,  probability: 0.04 },  // 4%
  { type: 'coins', value: 15,  probability: 0.15 },  // 15%
  { type: 'coins', value: 5,   probability: 0.40 },  // 40%
];

function determinePrize() {
    const random = Math.random();
    let cumulativeProbability = 0;
    for (const item of prizes) {
        cumulativeProbability += item.probability;
        if (random < cumulativeProbability) {
            return item;
        }
    }
    return { type: 'coins', value: 5 }; // Fallback prize
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
        
        // Safety net for gamification fields
        if (typeof user.coins !== 'number') user.coins = 0;
        if (typeof user.exp !== 'number') user.exp = 0;

        if (user.coins < GACHA_COST) {
            return NextResponse.json({ error: 'Insufficient coins' }, { status: 403 });
        }

        user.coins -= GACHA_COST;
        const prizeWon = determinePrize();
        let leveledUp = false;

        if (prizeWon.type === 'exp') {
            user.exp += prizeWon.value;
            // Check for level up after winning EXP
            if (user.exp >= user.nextLevelExp) {
                leveledUp = true;
                user.level += 1;
                user.exp -= user.nextLevelExp;
                user.nextLevelExp = Math.floor(50 * Math.pow(1.85, user.level - 1));
            }
        } else if (prizeWon.type === 'coins') {
            user.coins += prizeWon.value;
        }

        await user.save();
        
        return NextResponse.json({ 
            prize: prizeWon, 
            leveledUp: leveledUp,
            updatedUser: {
                level: user.level,
                exp: user.exp,
                nextLevelExp: user.nextLevelExp,
                coins: user.coins,
            }
        });

    } catch (error) {
        console.error('Gacha API error:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
