
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectDB();
    const user = await User.findById(decoded.id).select(
        'email _id username credits role achievements unlockedThemes level exp nextLevelExp coins'
    );

    if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
    }

    // Ensure arrays are always arrays
    const achievements = Array.isArray(user.achievements) ? user.achievements : [];
    const unlockedThemes = Array.isArray(user.unlockedThemes) && user.unlockedThemes.length > 0 ? user.unlockedThemes : ['minimalist'];

    return NextResponse.json({ 
        user: { 
            id: user._id, 
            email: user.email, 
            username: user.username, 
            credits: user.credits ?? 0, 
            role: user.role, 
            achievements,
            unlockedThemes,
            level: user.level ?? 1,
            exp: user.exp ?? 0,
            nextLevelExp: user.nextLevelExp ?? 50,
            coins: user.coins ?? 0,
        } 
    });
  } catch (error) {
    // This can happen if the token is invalid or expired
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
