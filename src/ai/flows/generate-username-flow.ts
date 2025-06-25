'use server';

/**
 * @fileOverview A flow to generate a unique and creative username.
 *
 * - generateUsername - A function that generates a username.
 * - GenerateUsernameOutput - The return type for the generateUsername function.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateUsernameOutputSchema,
    type GenerateUsernameOutput,
} from '@/ai/schemas';

export async function generateUsername(): Promise<GenerateUsernameOutput> {
  return generateUsernameFlow();
}

const generateUsernameFlow = ai.defineFlow(
  {
    name: 'generateUsernameFlow',
    outputSchema: GenerateUsernameOutputSchema,
  },
  async () => {
    const prompt = `Generate a single, unique, and creative username. The username should be a combination of two English words, in PascalCase, without spaces or special characters. It should be memorable and fun. Examples: "StarlightVoyager", "PixelPioneer", "CrimsonWanderer", "QuantumJester". The username must be between 6 and 20 characters long.`;
    
    const response = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
      output: {
        schema: GenerateUsernameOutputSchema,
      },
      config: {
        temperature: 0.9,
      },
    });

    return response.output!;
  }
);
