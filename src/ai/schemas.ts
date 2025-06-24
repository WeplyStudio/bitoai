import { z } from 'genkit';

// From chat.ts
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  content: z.string(),
  imageUrl: z.string().optional().describe("URL of a user-uploaded image, if any."),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  mode: z.enum(['default', 'creative', 'professional', 'storyteller', 'sarcastic', 'technical', 'philosopher']).optional().describe('The personality mode for the AI response.'),
  language: z.enum(['id', 'en', 'zh', 'ja']).optional().describe('The language for the AI response.'),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  content: z.string(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

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

// From generate-image.ts (disabled) - schemas removed

// From rename-project-flow.ts
export const RenameProjectInputSchema = z.object({
  chatHistory: z.string().describe('The chat history to be used for generating a project name.'),
});
export type RenameProjectInput = z.infer<typeof RenameProjectInputSchema>;

export const RenameProjectOutputSchema = z.object({
  projectName: z.string().describe('A short, descriptive project name based on the chat history.'),
});
export type RenameProjectOutput = z.infer<typeof RenameProjectOutputSchema>;

// From generate-initial-prompt.ts
export const InitialPromptOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of 4 initial prompt suggestions.'),
});
export type InitialPromptOutput = z.infer<typeof InitialPromptOutputSchema>;
