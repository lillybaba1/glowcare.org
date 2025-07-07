
'use server';

/**
 * @fileOverview An AI chatbot for answering customer questions and giving skincare advice.
 *
 * - skincareChatbot - A function that handles the chatbot interaction.
 * - SkincareChatbotInput - The input type for the skincareChatbot function.
 * - SkincareChatbotOutput - The return type for the skincareChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';


const MessageSchema = z.object({
  role: z.enum(['user', 'bot']),
  content: z.string(),
});

const SkincareChatbotInputSchema = z.object({
  history: z.array(MessageSchema).describe('The history of the conversation.'),
  productContext: z
    .object({
      name: z.string(),
      description: z.string(),
    })
    .optional()
    .describe('The product the user is currently viewing, if any.'),
  isAdmin: z.boolean().optional().describe('Whether the current user is an admin.'),
});
export type SkincareChatbotInput = z.infer<typeof SkincareChatbotInputSchema>;

const SkincareChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type SkincareChatbotOutput = z.infer<typeof SkincareChatbotOutputSchema>;

export async function skincareChatbot(input: SkincareChatbotInput): Promise<SkincareChatbotOutput> {
  return skincareChatbotFlow(input);
}

const getStoreInventory = ai.defineTool(
  {
    name: 'getStoreInventory',
    description: 'Gets the current inventory details for all products in the store, including their stock levels.',
    outputSchema: z.array(
      z.object({
        name: z.string(),
        stock: z.number().optional(),
      })
    ),
  },
  async () => {
    const products: Product[] = await getProducts();
    // Return only name and stock for the tool's purpose
    return products.map(p => ({ name: p.name, stock: p.stock }));
  }
);

const prompt = ai.definePrompt({
  name: 'skincareChatbotPrompt',
  input: {schema: SkincareChatbotInputSchema},
  output: {schema: SkincareChatbotOutputSchema},
  tools: [getStoreInventory],
  prompt: `{{#if isAdmin}}
You are a direct and efficient business assistant for GlowCare Gambia's store administrator. Your role is to provide factual answers to internal questions. You have access to tools to fetch data like inventory levels. Answer all admin questions directly.
{{else}}
You are a friendly and expert skincare assistant for GlowCare Gambia, an online skincare store. Your personality is helpful, professional, and welcoming. IMPORTANT: You must NEVER reveal internal business information like stock quantities, sales figures, or supplier details. If a customer asks for this information, politely state that you cannot provide it and offer to help with skincare advice or product information instead.
{{/if}}

Use the conversation history to understand the context. Do not repeat greetings in every message. Get straight to the point while maintaining the appropriate tone for your role (Admin Assistant or Customer Assistant).

{{#if productContext}}
The user is currently looking at this product. If their question is about it, use this context:
- Product Name: {{productContext.name}}
- Product Description: {{productContext.description}}
{{/if}}

CONVERSATION HISTORY:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the conversation, what is your next response as the 'bot'?`,
});

const skincareChatbotFlow = ai.defineFlow(
  {
    name: 'skincareChatbotFlow',
    inputSchema: SkincareChatbotInputSchema,
    outputSchema: SkincareChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
