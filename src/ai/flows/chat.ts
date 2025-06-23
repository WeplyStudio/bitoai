'use server';

import { ai } from '@/ai/genkit';
import { MessageData, Role, Part } from 'genkit';
import type { ChatRequest, ChatMessage } from '@/ai/schemas';
import { generateImage } from './generate-image';

export async function chat(input: ChatRequest): Promise<ChatMessage> {
  const lastUserMessage = input.messages[input.messages.length - 1];
  const imagePromptRegex = /^(generate|create|draw)\s+(an\s+)?image\s+/i;

  // Handle explicit image generation requests if there's no image uploaded with the prompt
  if (lastUserMessage && lastUserMessage.role === 'user' && !lastUserMessage.imageUrl && lastUserMessage.content && imagePromptRegex.test(lastUserMessage.content)) {
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

  // Handle standard chat, including multimodal (text + image) input
  const history: MessageData[] = input.messages.map(msg => {
    const content: Part[] = [];

    // Always add text content if it exists
    if (msg.content) {
        content.push({ text: msg.content });
    }

    // For user messages, also add the image if it exists
    if (msg.role === 'user' && msg.imageUrl) {
      content.push({ media: { url: msg.imageUrl } });
    }
    
    // If a message has no content at all (e.g., image-only upload), add a placeholder.
    if (content.length === 0) {
        content.push({text: ''});
    }

    return {
      role: msg.role as Role,
      content,
    };
  });

  let systemInstruction = `You are Bito AI, a helpful and friendly AI assistant developed by JDev. You are part of a web application designed to help with creative and business tasks. Your persona should be professional, creative, and helpful. If the user uploads an image, you can analyze it and answer questions about it.`;
  let temperature = 0.7;

  switch (input.mode) {
    case 'creative':
      systemInstruction = `You are Bito AI, a highly creative and imaginative AI assistant developed by JDev. You excel at brainstorming, storytelling, and generating novel ideas. Your tone is enthusiastic and inspiring.`;
      temperature = 1.0;
      break;
    case 'professional':
      systemInstruction = `You are Bito AI, a formal and professional AI assistant developed by JDev. Your responses are concise, structured, and geared towards business and technical tasks. Maintain a formal tone.`;
      temperature = 0.4;
      break;
    default: // 'default' mode
      // Use the default values
      break;
  }

  const messagesWithSystem: MessageData[] = [
    { role: 'system', content: [{ text: systemInstruction }] },
    ...history,
  ];

  const response = await ai.generate({
    model: ai.model,
    messages: messagesWithSystem,
    config: {
      temperature: temperature,
    },
  });

  const responseText = response.text;
  
  return {
    role: 'model',
    content: responseText,
  };
}
