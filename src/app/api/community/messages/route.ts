
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CommunityMessage from '@/models/CommunityMessage';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sanitizes a string by escaping HTML characters to prevent XSS attacks.
 * @param text The input string to sanitize.
 * @returns The sanitized string.
 */
function sanitize(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m as keyof typeof map]);
}

export async function GET() {
  await connectDB();
  try {
    const messages = await CommunityMessage.find({}).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  await connectDB();
  
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'You must be logged in to post messages.' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }
    
    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token payload.' }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('username achievements');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found.' }, { status: 401 });
    }

    // **SAFETY NET**: If an old user account has no achievements field, initialize it.
    if (!Array.isArray(user.achievements)) {
        user.achievements = [];
    }

    const { content } = await request.json();
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Sanitize user input before saving to the database to prevent XSS
    const sanitizedContent = sanitize(content);

    const newMessage = new CommunityMessage({
      content: sanitizedContent,
      author: user.username,
    });

    await newMessage.save();
    
    let finalAchievements = user.achievements;
    // --- Achievement Logic ---
    if (!user.achievements.includes('first_community_post')) {
      const updatedUser = await User.findByIdAndUpdate(user._id, 
        { $addToSet: { achievements: 'first_community_post' } },
        { new: true }
      );
      if (updatedUser) {
        finalAchievements = updatedUser.achievements;
      }
    }
    // --- End Achievement Logic ---

    return NextResponse.json({ message: newMessage, newAchievements: finalAchievements }, { status: 201 });
  } catch (error) {
    console.error('Failed to post message:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
