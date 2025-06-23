'use server';

import { ai } from '@/ai/genkit';
import { MessageData, Role } from 'genkit';
import type { ChatRequest, ChatMessage } from '@/ai/schemas';

export async function chat(input: ChatRequest): Promise<ChatMessage> {
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
