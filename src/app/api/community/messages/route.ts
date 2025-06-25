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
  await connectDB();
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let authorName = 'Anonymous';

    // Check for user token to get their username
    if (JWT_SECRET) {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
                if (decoded) {
                    const user = await User.findById(decoded.id).select('username');
                    if (user) {
                        authorName = user.username;
                    }
                }
            } catch (e) {
                // Token is invalid or expired, user remains anonymous
                console.log("Community post with invalid token, user is Anonymous.");
            }
        }
    }


    // Sanitize user input before saving to the database to prevent XSS
    const sanitizedContent = sanitize(content);

    const newMessage = new CommunityMessage({
      content: sanitizedContent,
      author: authorName,
    });

    await newMessage.save();
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to post message:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
