'use server';

/**
 * @fileOverview A flow to generate initial prompts for the Script AI chat application.
 *
 * - generateInitialPrompt - A function that generates initial prompts.
 * - InitialPromptOutput - The output type for the generateInitialPrompt function.
 */

import {ai} from '@/ai/genkit';
import {
    InitialPromptOutputSchema,
    type InitialPromptOutput,
} from '@/ai/schemas';

export async function generateInitialPrompt(): Promise<InitialPromptOutput> {
  return generateInitialPromptFlow();
}

const initialPrompt = ai.definePrompt({
  name: 'initialPrompt',
  output: {schema: InitialPromptOutputSchema},
  prompt: `You are Script AI, an AI assistant. Suggest 4 initial prompts that a new user can use to start a conversation with you. The prompts should be about creative or business tasks like writing copy, generating images, creating avatars, or writing code. Return the prompts as a JSON array of strings.`,
});

const generateInitialPromptFlow = ai.defineFlow(
  {
    name: 'generateInitialPromptFlow',
    outputSchema: InitialPromptOutputSchema,
  },
  async () => {
    const {output} = await initialPrompt({});
    return output!;
  }
);
