
'use server';

/**
 * @fileOverview An AI flow for verifying customer ID images.
 *
 * - verifyIdImages - A function that checks if images are clear and look like IDs.
 * - VerifyIdInput - The input type for the verifyIdImages function.
 * - VerifyIdOutput - The return type for the verifyIdImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyIdInputSchema = z.object({
  idFrontDataUri: z.string().describe(
      "A photo of the front of an ID card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  idBackDataUri: z.string().describe(
      "A photo of the back of an ID card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyIdInput = z.infer<typeof VerifyIdInputSchema>;

const VerifyIdOutputSchema = z.object({
  isIdCard: z.boolean().describe('Whether or not both images appear to be legitimate government-issued ID cards.'),
  isClear: z.boolean().describe('Whether or not both images are clear, in focus, and not obscured.'),
  reason: z.string().describe("A brief, user-friendly reason explaining why verification failed. Empty if successful."),
});
export type VerifyIdOutput = z.infer<typeof VerifyIdOutputSchema>;

export async function verifyIdImages(input: VerifyIdInput): Promise<VerifyIdOutput> {
  return verifyIdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyIdPrompt',
  input: {schema: VerifyIdInputSchema},
  output: {schema: VerifyIdOutputSchema},
  prompt: `You are an automated ID verification assistant for an e-commerce store. You will be given two images: the front and back of a customer's ID card.

Your task is to determine two things:
1. Do the images appear to be legitimate government-issued ID cards (like a national ID, driver's license, passport card, etc.)?
2. Are the images clear, in focus, well-lit, and not obscured? The text should be generally readable, even if you can't make out the specific details.

If both images seem to be valid ID cards AND are clear, set 'isIdCard' and 'isClear' to true and 'reason' to an empty string.
If an image is blurry, dark, or hard to see, set 'isClear' to false and provide a reason like "The front image is too blurry." or "The back image is too dark."
If an image does not look like an ID card at all (e.g., it's a picture of a cat), set 'isIdCard' to false and provide a reason like "The front image does not appear to be an ID card."

Front of ID:
{{media url=idFrontDataUri}}

Back of ID:
{{media url=idBackDataUri}}`,
});

const verifyIdFlow = ai.defineFlow(
  {
    name: 'verifyIdFlow',
    inputSchema: VerifyIdInputSchema,
    outputSchema: VerifyIdOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error("The AI model did not return a valid response.");
        }
        return output;
    } catch(e) {
        console.error("Error in ID verification flow", e);
        // Fallback to a failed state if the AI call fails for any reason
        return {
            isIdCard: false,
            isClear: false,
            reason: "We couldn't process the ID images. Please try uploading them again."
        };
    }
  }
);
