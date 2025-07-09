
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

// --- Tools ---

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


// --- Prompts ---

const adminPrompt = ai.definePrompt({
  name: 'skincareAdminChatbotPrompt',
  input: {schema: SkincareChatbotInputSchema},
  output: {schema: SkincareChatbotOutputSchema},
  tools: [getStoreInventory],
  prompt: `You are a business operations assistant for GlowCare Gambia's store administrator.
Your primary role is to provide direct, factual answers to internal questions about the store's inventory and products.
When asked about stock levels, inventory, or product details, you MUST use the 'getStoreInventory' tool to fetch the required data.
Provide the information retrieved from the tool directly and efficiently.

Example Interaction:
Admin: "How many CeraVe cleansers are in stock?"
You: *Calls getStoreInventory* -> "There are 25 CeraVe Foaming Cleansers in stock."

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


const customerPrompt = ai.definePrompt({
  name: 'skincareCustomerChatbotPrompt',
  input: {schema: SkincareChatbotInputSchema},
  output: {schema: SkincareChatbotOutputSchema},
  tools: [getProductListForRecommendations],
  prompt: `You are a friendly and expert skincare advisor for GlowCare Gambia.
Your main job is to help customers find the right products for their skin.

When a customer asks for a product recommendation for a specific need (like "oily skin", "acne", "sunscreen"), you MUST follow these steps:
1. Call the 'getProductListForRecommendations' tool to see the available products and their descriptions.
2. Analyze the list of products from the tool.
3. Recommend one or more specific products that are suitable for the customer's need.
4. For each recommendation, explain *why* it's a good choice, referencing its description from the tool.

It is your job to give recommendations. DO NOT refuse.

If a customer asks for confidential business details (like "how many are in stock?", "what's your profit margin?"), you MUST politely decline and steer the conversation back to skincare advice.

Example Interaction:
Customer: "What do you have for dry skin?"
You: *Calls getProductListForRecommendations* -> "For dry skin, I recommend our 'Nivea Rich Nourishing Body Lotion'. It's great because its description says it provides deep moisture for up to 48 hours. Another excellent choice is the 'CeraVe Moisturizing Cream', which helps restore the skin's protective barrier."

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
  async (input) => {
    try {
      const promptToUse = input.isAdmin ? adminPrompt : customerPrompt;
      const { output } = await promptToUse(input);

      if (!output) {
        return {
          response:
            "I'm sorry, I'm not sure how to respond to that. Please try rephrasing your question.",
        };
      }
      return output;
    } catch (error) {
      console.error("Error in skincare chatbot flow:", error);
      return {
        response:
          "I'm sorry, but I encountered an error while trying to generate a response. Please try again.",
      };
    }
  }
);
