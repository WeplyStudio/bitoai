import { z } from 'genkit';

// From chat.ts
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  content: z.string(),
  imageUrl: z.string().optional().describe("URL of a generated image, if any."),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  mode: z.enum(['default', 'creative', 'professional']).optional().describe('The personality mode for the AI response.'),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// From feedback-incorporation.ts
export const IncorporateFeedbackInputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt that generated the initial response.'),
  aiResponse: z.string().describe('The AI-generated response that the user is providing feedback on.'),
  feedback: z.string().describe('The user feedback on the AI response.  This should describe how to improve the AI response in the future.'),
});
export type IncorporateFeedbackInput = z.infer<typeof IncorporateFeedbackInputSchema>;

export const IncorporateFeedbackOutputSchema = z.object({
  improvedResponse: z.string().describe('The AI response improved based on the user feedback.'),
});
export type IncorporateFeedbackOutput = z.infer<typeof IncorporateFeedbackOutputSchema>;

// From summarize-chat.ts
export const SummarizeChatInputSchema = z.object({
  chatHistory: z.string().describe('The complete chat history to summarize.'),
});
export type SummarizeChatInput = z.infer<typeof SummarizeChatInputSchema>;

export const SummarizeChatOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the chat history.'),
});
export type SummarizeChatOutput = z.infer<typeof SummarizeChatOutputSchema>;

// From generate-image.ts
export const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;
