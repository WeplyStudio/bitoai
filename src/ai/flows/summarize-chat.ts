'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing chat conversations.
 *
 * - summarizeChat - A function that summarizes the current chat.
 * - SummarizeChatInput - The input type for the summarizeChat function.
 * - SummarizeChatOutput - The return type for the summarizeChat function.
 */

import {ai} from '@/ai/genkit';
import {
    SummarizeChatInputSchema,
    type SummarizeChatInput,
    SummarizeChatOutputSchema,
    type SummarizeChatOutput,
} from '@/ai/schemas';

export async function summarizeChat(input: SummarizeChatInput): Promise<SummarizeChatOutput> {
  return summarizeChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChatPrompt',
  input: {schema: SummarizeChatInputSchema},
  output: {schema: SummarizeChatOutputSchema},
  prompt: `You are an AI assistant summarizing a chat conversation.

  Please provide a concise summary of the following chat history:

  {{chatHistory}}
  `,
});

const summarizeChatFlow = ai.defineFlow(
  {
    name: 'summarizeChatFlow',
    inputSchema: SummarizeChatInputSchema,
    outputSchema: SummarizeChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
