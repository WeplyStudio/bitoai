'use server';

/**
 * @fileOverview A flow to automatically generate a project name from a chat history.
 *
 * - renameProject - A function that generates a project name.
 * - RenameProjectInput - The input type for the renameProject function.
 * - RenameProjectOutput - The return type for the renameProject function.
 */

import {ai} from '@/ai/genkit';
import {
    RenameProjectInputSchema,
    type RenameProjectInput,
    RenameProjectOutputSchema,
    type RenameProjectOutput,
} from '@/ai/schemas';

export async function renameProject(input: RenameProjectInput): Promise<RenameProjectOutput> {
  return renameProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'renameProjectPrompt',
  input: {schema: RenameProjectInputSchema},
  output: {schema: RenameProjectOutputSchema},
  prompt: `You are an expert at creating concise, descriptive titles. Based on the following chat conversation, create a short and relevant project title. The title should be a maximum of 5 words. Do not use quotation marks in the title.

  Chat History:
  {{{chatHistory}}}
  `,
});

const renameProjectFlow = ai.defineFlow(
  {
    name: 'renameProjectFlow',
    inputSchema: RenameProjectInputSchema,
    outputSchema: RenameProjectOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
