'use server';

import { ai } from '@/ai/genkit';
import { MessageData, Role, Part } from 'genkit';
import type { ChatRequest, ChatMessage, GenerateImageOutput } from '@/ai/schemas';
import { generateImageTool } from './generate-image';

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

  let baseSystemInstruction = `You are Bito AI, a helpful and friendly AI assistant developed by JDev. You are part of a web application designed to help with creative and business tasks. Your persona should be professional, creative, and helpful. If the user uploads an image, you can analyze it and answer questions about it. You have the ability to generate images. If the user asks for an image or describes something they want to see visually, use the generateImageTool.`;
  let temperature = 0.7;

  switch (input.mode) {
    case 'creative':
      baseSystemInstruction = `You are Bito AI, a highly creative and imaginative AI assistant developed by JDev. You excel at brainstorming, storytelling, and generating novel ideas. Your tone is enthusiastic and inspiring. You have the ability to generate images. If the user asks for an image or describes something they want to see visually, use the generateImageTool.`;
      temperature = 1.0;
      break;
    case 'professional':
      baseSystemInstruction = `You are Bito AI, a formal and professional AI assistant developed by JDev. Your responses are concise, structured, and geared towards business and technical tasks. Maintain a formal tone. You have the ability to generate images. If the user asks for an image or describes something they want to see visually, use the generateImageTool.`;
      temperature = 0.4;
      break;
    default:
      break;
  }

  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    system: baseSystemInstruction,
    messages: history,
    tools: [generateImageTool],
    config: {
      temperature: temperature,
    },
  });

  const responseText = response.text;
  let imageUrl: string | undefined;

  if (response.history) {
    // Find messages with the 'tool' role, which contain tool responses.
    const toolResponseMessages = response.history.filter(m => m.role === 'tool');
    for (const msg of toolResponseMessages) {
      // Find the specific part corresponding to our image generation tool.
      const toolPart = msg.content.find(p => p.toolResponse?.name === 'generateImageTool');
      if (toolPart?.toolResponse?.output) {
        const output = toolPart.toolResponse.output as GenerateImageOutput;
        if (output.imageUrl) {
          imageUrl = output.imageUrl;
          break; // Found it, no need to look further.
        }
      }
    }
  }
  
  return {
    role: 'model',
    content: responseText,
    imageUrl: imageUrl,
  };
}
