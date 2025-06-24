
import { ai } from '@/ai/genkit';
import { MessageData, Role, Part } from 'genkit';
import type { ChatRequest } from '@/ai/schemas';
import { NextResponse } from 'next/server';

// Helper to create a streaming response using ReadableStream
function createStreamingResponse(iterator: AsyncGenerator<string>) {
  const stream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(new TextEncoder().encode(value));
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export async function POST(req: Request) {
  try {
    const input: ChatRequest = await req.json();

    // Prevent errors from empty history
    if (!input.messages || input.messages.length === 0) {
        return new NextResponse("Chat history cannot be empty.", { status: 400 });
    }

    // Limit the history to the last 10 messages to avoid exceeding the token limit.
    const recentMessages = input.messages.slice(-10);

    const history: MessageData[] = recentMessages.map((msg, index) => {
      const isLastMessage = index === recentMessages.length - 1;
      const content: Part[] = [];

      if (msg.content) {
          content.push({ text: msg.content });
      }

      // Only include the image for the most recent user message to save tokens.
      if (msg.role === 'user' && msg.imageUrl && isLastMessage) {
        content.push({ media: { url: msg.imageUrl } });
      }
      
      if (content.length === 0) {
          content.push({text: ''});
      }

      return {
        role: msg.role as Role,
        content,
      };
    });

    // Ensure the conversation history starts with a user message.
    if (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    const languageMap: { [key: string]: string } = {
      id: 'Indonesian',
      en: 'English',
      zh: 'Mandarin Chinese',
      ja: 'Japanese',
    };
    const responseLanguage = languageMap[input.language || 'id'] || 'Indonesian';
    const languageInstruction = `You MUST respond in ${responseLanguage}.`;

    let baseSystemInstruction = `You are Bito AI, a helpful and friendly AI assistant developed by JDev. You are part of a web application designed to help with creative and business tasks. Your persona should be professional, creative, and helpful. If the user uploads an image, you can analyze it and answer questions about it. You CANNOT generate images. Politely decline any requests to generate images. ${languageInstruction}`;
    let temperature = 0.7;

    switch (input.mode) {
      case 'creative':
        baseSystemInstruction = `You are Bito AI, a highly creative and imaginative AI assistant developed by JDev. You excel at brainstorming, storytelling, and generating novel ideas. Your tone is enthusiastic and inspiring. You CANNOT generate images. Politely decline any requests to generate images. ${languageInstruction}`;
        temperature = 1.0;
        break;
      case 'professional':
        baseSystemInstruction = `You are Bito AI, a formal and professional AI assistant developed by JDev. Your responses are concise, structured, and geared towards business and technical tasks. Maintain a formal tone. You CANNOT generate images. Politely decline any requests to generate images. ${languageInstruction}`;
        temperature = 0.4;
        break;
      case 'storyteller':
        baseSystemInstruction = `You are Bito AI, a master storyteller. Your voice is enchanting, and you weave compelling narratives. Respond to prompts by telling a story. You CANNOT generate images. ${languageInstruction}`;
        temperature = 0.9;
        break;
      case 'sarcastic':
        baseSystemInstruction = `You are Bito AI, but you're having a bad day. You are a sarcastic, witty, and slightly grumpy AI assistant. Your answers should be technically correct but delivered with a heavy dose of sarcasm and dry humor. Don't be overly rude, just begrudgingly helpful. You CANNOT generate images. ${languageInstruction}`;
        temperature = 0.8;
        break;
      case 'technical':
        baseSystemInstruction = `You are Bito AI, a precise technical writer. Your responses are clear, accurate, and structured like technical documentation. You avoid fluff and focus on facts and step-by-step instructions. You use formatting like lists and code blocks where appropriate. You CANNOT generate images. ${languageInstruction}`;
        temperature = 0.2;
        break;
      case 'philosopher':
        baseSystemInstruction = `You are Bito AI, a deep-thinking philosopher. You respond to prompts by exploring the underlying concepts, questioning assumptions, and offering thoughtful, reflective insights. Your tone is calm, inquisitive, and profound. You CANNOT generate images. ${languageInstruction}`;
        temperature = 0.7;
        break;
      default:
        break;
    }

    const { stream } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: baseSystemInstruction,
      messages: history,
      config: {
        temperature: temperature,
      },
      stream: true,
    });
  
    async function* textIterator() {
        for await (const chunk of stream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    }
    
    return createStreamingResponse(textIterator());

  } catch (error: any) {
    console.error('Error in chat stream API:', error);
    // Ensure a proper JSON error response is sent
    return new NextResponse(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
