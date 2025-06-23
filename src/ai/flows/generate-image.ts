'use server';

/**
 * @fileOverview A tool for generating images from a text prompt.
 *
 * - generateImageTool - A Genkit tool that generates an image.
 */

import { ai } from '@/ai/genkit';
import { GenerateImageInputSchema, GenerateImageOutputSchema } from '@/ai/schemas';

export const generateImageTool = ai.defineTool(
    {
        name: 'generateImageTool',
        description: 'Generates an image from a text description. Use this when the user asks to create, draw, or generate a picture, photo, or image.',
        inputSchema: GenerateImageInputSchema,
        outputSchema: GenerateImageOutputSchema,
    },
    async (input) => {
        const { media } = await ai.generate({
            model: 'googleai/imagen-2',
            prompt: input.prompt,
        });

        if (!media || media.length === 0 || !media[0].url) {
            throw new Error('Image generation failed to return an image.');
        }

        return { imageUrl: media[0].url };
    }
);
