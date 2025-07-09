
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
import { db } from '@/lib/firebase';
import { ref, query, limitToLast, get } from 'firebase/database';


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
  // This will be populated by the flow, not the client
  productList: z.string().optional().describe('A list of available products.'),
});
export type SkincareChatbotInput = z.infer<typeof SkincareChatbotInputSchema>;

const SkincareChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type SkincareChatbotOutput = z.infer<typeof SkincareChatbotOutputSchema>;

export async function skincareChatbot(input: Omit<SkincareChatbotInput, 'productList'>): Promise<SkincareChatbotOutput> {
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

const getAdminEventsLog = ai.defineTool(
  {
    name: 'getAdminEventsLog',
    description: 'Retrieves a log of recent, important store events like new orders, new user registrations, or failed ID verifications. Use this to answer questions about store activity.',
    outputSchema: z.array(z.object({
        createdAt: z.number(),
        type: z.string(),
        message: z.string(),
    }))
  },
  async () => {
    try {
        const eventsRef = ref(db, 'events_log');
        const eventsQuery = query(eventsRef, limitToLast(20));
        const snapshot = await get(eventsQuery);
        if (snapshot.exists()) {
            const eventsObj = snapshot.val();
            const eventsArray = Object.keys(eventsObj).map(key => ({
                id: key,
                ...eventsObj[key],
            }));
            // Return a simplified version for the AI, newest first
            return eventsArray.map(e => ({
                createdAt: e.createdAt,
                type: e.type,
                message: e.message
            })).reverse();
        }
        return [];
    } catch (e) {
        console.error("Tool getAdminEventsLog failed:", e);
        // Let the AI know it failed.
        return [{ createdAt: Date.now(), type: 'TOOL_ERROR', message: 'Failed to fetch events log. There might be a database permission error.' }];
    }
  }
);

// --- Prompts ---

const adminPrompt = ai.definePrompt({
  name: 'skincareAdminChatbotPrompt',
  input: {schema: SkincareChatbotInputSchema},
  output: {schema: SkincareChatbotOutputSchema},
  tools: [getStoreInventory, getAdminEventsLog],
  prompt: `You are a business operations assistant for GlowCare Gambia's store administrator.
Your persona is strictly professional and data-focused.
Your roles are:
1. Provide direct, factual answers to internal questions about the store's inventory and products using the 'getStoreInventory' tool.
2. Report on recent store activity by using the 'getAdminEventsLog' tool. This log tracks new orders, user sign-ups, and failed ID verifications.

When asked about stock levels or inventory, you MUST use the 'getStoreInventory' tool.
When asked general questions about "what's happening", "recent activity", "new users", or "any issues", you MUST use the 'getAdminEventsLog' tool.

Provide the information retrieved from the tools directly and efficiently. Do not add conversational fluff.

Example Inventory Interaction:
Admin: "How many CeraVe cleansers are in stock?"
You: *Calls getStoreInventory* -> "There are 25 CeraVe Foaming Cleansers in stock."

Example Activity Interaction:
Admin: "What's the latest activity?"
You: *Calls getAdminEventsLog* -> "At 10:45 AM, a new order #A4F8K9B2 was placed by John Doe. At 10:42 AM, a user failed ID verification."

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
  prompt: `You are a friendly and expert skincare advisor for GlowCare Gambia.
Your role is to provide skincare advice and help customers find the right products from our store.

**CRITICAL INSTRUCTIONS:**
1. You have been provided with a list of all available products in the store context below.
2. When a customer asks for a product recommendation for a specific need (e.g., "oily skin", "acne"), you **MUST ONLY** recommend products from the provided product list.
3. This list is your ONLY source of product information. Do not use your general knowledge.
4. If the product list is empty, you must inform the user that there are no products available.
5. If a customer asks if you have a product that is not on the list, you **MUST** state that it is not available.

**DO NOT** invent products or claim we have products that are not on the list provided. Your knowledge is strictly limited to the provided product list.

Example Interaction (Recommendation):
Customer: "What do you have for dry skin?"
You: *Looks at the product list* -> "For dry skin, I recommend our 'CeraVe Moisturizing Cream'. It's great because it provides deep moisture."

Example Interaction (Product Not Found):
Customer: "Do you have Neutrogena Hydro Boost?"
You: *Looks at the product list, sees Neutrogena is not on it* -> "I'm sorry, we don't currently have the Neutrogena Hydro Boost in stock. However, for hydration, you might like our CeraVe Moisturizing Cream."

Maintain a friendly, helpful, and encouraging tone. Use the conversation history to understand the context.

{{#if productContext}}
The user is currently looking at this product. If their question is about it, use this context:
- Product Name: {{productContext.name}}
- Product Description: {{productContext.description}}
{{/if}}

AVAILABLE PRODUCT LIST:
{{{productList}}}

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
      // For customers, we fetch product data and pass it into the prompt.
      // This is more reliable than using a tool for data that is always needed.
      if (!input.isAdmin) {
        const products = await getProducts();
        if (products.length === 0) {
          input.productList = "There are currently no products available to recommend.";
        } else {
          input.productList = products
            .map(p => `Name: ${p.name}\nDescription: ${p.description}`)
            .join('\n\n');
        }
      }

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
