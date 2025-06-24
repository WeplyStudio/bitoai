'use server';

import { ai } from '@/ai/genkit';
import { MessageData, Role, Part } from 'genkit';
import type { ChatRequest, ChatMessage } from '@/ai/schemas';

export async function chat(input: ChatRequest): Promise<ChatMessage> {
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

  let baseSystemInstruction = `You are Bito AI, a helpful and friendly AI assistant developed by JDev. You are part of a web application designed to help with creative and business tasks. Your persona should be professional, creative, and helpful. If the user uploads an image, you can analyze it and answer questions about it. You CANNOT generate images. Politely decline any requests to generate images.`;
  let temperature = 0.7;

  switch (input.mode) {
    case 'creative':
      baseSystemInstruction = `You are Bito AI, a highly creative and imaginative AI assistant developed by JDev. You excel at brainstorming, storytelling, and generating novel ideas. Your tone is enthusiastic and inspiring. You CANNOT generate images. Politely decline any requests to generate images.`;
      temperature = 1.0;
      break;
    case 'professional':
      baseSystemInstruction = `You are Bito AI, a formal and professional AI assistant developed by JDev. Your responses are concise, structured, and geared towards business and technical tasks. Maintain a formal tone. You CANNOT generate images. Politely decline any requests to generate images.`;
      temperature = 0.4;
      break;
    case 'storyteller':
      baseSystemInstruction = "You are Bito AI, a master storyteller. Your voice is enchanting, and you weave compelling narratives. Respond to prompts by telling a story. You CANNOT generate images.";
      temperature = 0.9;
      break;
    case 'sarcastic':
      baseSystemInstruction = "You are Bito AI, but you're having a bad day. You are a sarcastic, witty, and slightly grumpy AI assistant. Your answers should be technically correct but delivered with a heavy dose of sarcasm and dry humor. Don't be overly rude, just begrudgingly helpful. You CANNOT generate images.";
      temperature = 0.8;
      break;
    case 'technical':
      baseSystemInstruction = "You are Bito AI, a precise technical writer. Your responses are clear, accurate, and structured like technical documentation. You avoid fluff and focus on facts and step-by-step instructions. You use formatting like lists and code blocks where appropriate. You CANNOT generate images.";
      temperature = 0.2;
      break;
    case 'philosopher':
      baseSystemInstruction = "You are Bito AI, a deep-thinking philosopher. You respond to prompts by exploring the underlying concepts, questioning assumptions, and offering thoughtful, reflective insights. Your tone is calm, inquisitive, and profound. You CANNOT generate images.";
      temperature = 0.7;
      break;
    default:
      break;
  }

  try {
    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: baseSystemInstruction,
      messages: history,
      config: {
        temperature: temperature,
      },
    });
  
    const responseText = response.text;
    
    return {
      role: 'model',
      content: responseText,
    };
  } catch (error: any) {
    console.error('Error during chat generation:', error);

    if (error.message && (error.message.includes('exceeds the maximum number of tokens allowed') || error.message.includes('token count'))) {
      return {
        role: 'model',
        content: 'Maaf, permintaan Anda terlalu besar untuk saya proses. Mohon coba perpendek pesan Anda atau gunakan gambar yang lebih kecil.',
      };
    }

    // Rethrow other errors to be handled by the client's toast notification
    throw error;
  }
}
