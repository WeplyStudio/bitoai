'use server';

import { ai } from '@/ai/genkit';
import { MessageData, Role } from 'genkit';
import type { ChatRequest, ChatMessage } from '@/ai/schemas';
import { generateImage } from './generate-image';

export async function chat(input: ChatRequest): Promise<ChatMessage> {
  const lastUserMessage = input.messages[input.messages.length - 1];
  const imagePromptRegex = /^(generate|create|draw)\s+(an\s+)?image\s+/i;

  if (lastUserMessage && lastUserMessage.role === 'user' && imagePromptRegex.test(lastUserMessage.content)) {
    try {
      const imagePrompt = lastUserMessage.content.replace(imagePromptRegex, '').trim();
      const { imageUrl } = await generateImage({ prompt: imagePrompt });

      return {
        role: 'model',
        content: `Here's the image you requested for: "${imagePrompt}"`,
        imageUrl,
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      return {
        role: 'model',
        content: "Sorry, I couldn't generate the image. There was an error.",
      };
    }
  }

  const history: MessageData[] = input.messages.map(msg => ({
    role: msg.role as Role,
    content: [{ text: msg.content }],
  }));

  const systemInstruction = `You are Script AI, a helpful and friendly AI assistant. You are part of a web application designed to help with creative and business tasks. Your persona should be professional, creative, and helpful.`;

  const messagesWithSystem: MessageData[] = [
    { role: 'system', content: [{ text: systemInstruction }] },
    ...history,
  ];

  const response = await ai.generate({
    model: ai.model,
    messages: messagesWithSystem,
    config: {
      temperature: 0.7,
    },
  });

  const responseText = response.text;
  
  return {
    role: 'model',
    content: responseText,
  };
}
