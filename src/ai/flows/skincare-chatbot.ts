
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
    description: 'Gets a formatted text list of all available products with their names and descriptions to help with customer recommendations.',
    outputSchema: z.string(),
  },
  async () => {
    const products: Product[] = await getProducts();
    if (products.length === 0) {
        return "There are currently no products available to recommend.";
    }
    // Format into a simple string for the model to parse easily
    return products
        .map(p => `Name: ${p.name}\nDescription: ${p.description}`)
        .join('\n\n');
  }
);

const countProducts = ai.defineTool(
  {
    name: 'countProducts',
    description: 'Counts the total number of different product types available in the store.',
    outputSchema: z.number(),
  },
  async () => {
    const products: Product[] = await getProducts();
    return products.length;
  }
);


// --- Prompts ---

const adminPrompt = ai.definePrompt({
  name: 'skincareAdminChatbotPrompt',
  input: {schema: SkincareChatbotInputSchema},
  output: {schema: SkincareChatbotOutputSchema},
  tools: [getStoreInventory],
  prompt: `You are a business operations assistant for GlowCare Gambia's store administrator.
Your persona is strictly professional and data-focused.
Your ONLY role is to provide direct, factual answers to internal questions about the store's inventory and products.
You MUST NOT engage in general chat or skincare advice.
When asked about stock levels or inventory, you MUST use the 'getStoreInventory' tool to fetch the required data.
Provide the information retrieved from the tool directly and efficiently. Do not add conversational fluff.

Example Interaction:
Admin: "How many CeraVe cleansers are in stock?"
You: *Calls getStoreInventory* -> "There are 25 CeraVe Foaming Cleansers in stock."

Use the conversation history to understand the context. Do not repeat greetings in every message. Get straight to the point.

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
  tools: [getProductListForRecommendations, countProducts],
  prompt: `You are a friendly and expert skincare advisor for GlowCare Gambia.
Your role is to provide skincare advice and help customers find the right products from our store.

**CRITICAL INSTRUCTIONS:**
1.  When a customer asks for a product recommendation for a specific need (e.g., "oily skin", "acne"), you **MUST** use the \`getProductListForRecommendations\` tool.
2.  You **MUST ONLY** recommend products that are returned by the \`getProductListForRecommendations\` tool. This is your ONLY source of product information. Do not use your general knowledge.
3.  If the tool returns "There are currently no products available to recommend.", you must inform the user of this.
4.  If a customer asks if you have a product that is not on the list from the tool, you **MUST** state that it is not available.
5.  For general questions about the number of products we sell, use the \`countProducts\` tool.

**DO NOT** invent products or claim we have products that are not on the list provided by the tool. Your knowledge is strictly limited to the tool's output.

Example Interaction 1 (Recommendation):
Customer: "What do you have for dry skin?"
You: *Calls getProductListForRecommendations, receives a list like "Name: CeraVe Moisturizing Cream\\nDescription:...", and then formulates the response.* -> "For dry skin, I recommend our 'CeraVe Moisturizing Cream'. It's great because it provides deep moisture."

Example Interaction 2 (Product Not Found):
Customer: "Do you have Neutrogena Hydro Boost?"
You: *Calls getProductListForRecommendations, sees Neutrogena is not on the list.* -> "I'm sorry, we don't currently have the Neutrogena Hydro Boost in stock. However, for hydration, you might like our CeraVe Moisturizing Cream."

Maintain a friendly, helpful, and encouraging tone. Use the conversation history to understand the context.

{{#if productContext}}
The user is currently looking at this product. If their question is about it, use this context:
- Product Name: {{productContext.name}}
- Product Description: {{productContext.description}}
{{/if}}

CONVERSATION HISTORY:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the conversation and your instructions, what is your next response as the 'bot'?`,
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
