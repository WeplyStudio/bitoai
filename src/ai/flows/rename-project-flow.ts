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

const renameProjectFlow = ai.defineFlow(
  {
    name: 'renameProjectFlow',
    inputSchema: RenameProjectInputSchema,
    outputSchema: RenameProjectOutputSchema,
  },
  async (input) => {
    const languageMap: { [key: string]: string } = {
        id: 'Indonesian',
        en: 'English',
        zh: 'Mandarin Chinese',
        ja: 'Japanese',
    };
    const titleLanguage = languageMap[input.language || 'id'] || 'Indonesian';

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      output: {
          schema: RenameProjectOutputSchema,
      },
      system: `You are an expert at creating concise, descriptive titles in ${titleLanguage}. Based on the following chat conversation, create a short and relevant project title. The title MUST be in ${titleLanguage}. The title should be a maximum of 5 words. Do not use quotation marks in the title.`,
      messages: [{ role: 'user', content: [{ text: `Chat History:\n${input.chatHistory}` }] }],
    });

    return response.output!;
  }
);
