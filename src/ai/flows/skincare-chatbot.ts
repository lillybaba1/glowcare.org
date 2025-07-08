
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

const getProductListForRecommendations = ai.defineTool(
  {
    name: 'getProductListForRecommendations',
    description: 'Gets a list of all available products with their names and descriptions to help with customer recommendations.',
    outputSchema: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    ),
  },
  async () => {
    const products: Product[] = await getProducts();
    // Return only name and description for recommendation purposes
    return products.map(p => ({ name: p.name, description: p.description }));
  }
);


const prompt = ai.definePrompt({
  name: 'skincareChatbotPrompt',
  input: {schema: SkincareChatbotInputSchema},
  output: {schema: SkincareChatbotOutputSchema},
  tools: [getStoreInventory, getProductListForRecommendations],
  prompt: `{{#if isAdmin}}
You are a direct and efficient business assistant for GlowCare Gambia's store administrator. Your role is to provide factual answers to internal questions. You have access to tools to fetch data like inventory levels. Answer all admin questions directly.
{{else}}
You are a friendly and expert skincare assistant for GlowCare Gambia. Your personality is helpful, professional, and welcoming.

Your main purpose is to give product recommendations to customers.

When a customer asks for a recommendation based on their skin type or concern (e.g., 'dry skin', 'acne', 'sun protection'):
1.  You MUST use the 'getProductListForRecommendations' tool to get a list of available products.
2.  From that list, you MUST choose one or more suitable products.
3.  You MUST explain WHY each product you recommend is a good choice for the customer's specific concern, using the product's description to support your reasoning.

NEVER say you cannot give recommendations. It is your job to recommend products.

If a customer asks for internal business information like stock levels, politely refuse and redirect them to skincare advice.
{{/if}}

Use the conversation history to understand the context. Do not repeat greetings in every message. Get straight to the point while maintaining the appropriate tone for your role.

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
    if (!output) {
      return { response: "I'm sorry, I'm not sure how to respond to that. Please try rephrasing your question." };
    }
    return output;
  }
);
