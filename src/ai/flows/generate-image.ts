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
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: input.prompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media || !media.url) {
            throw new Error('Image generation failed to return an image.');
        }

        return { imageUrl: media.url };
    }
);
