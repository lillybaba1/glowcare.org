
'use client';

import type { Product } from '@/lib/types';
import React, { createContext, useState, ReactNode, useContext } from 'react';

type ProductContext = Pick<Product, 'name' | 'description'> | null;

interface ChatbotContextType {
  productContext: ProductContext;
  setProductContext: (product: ProductContext) => void;
}

export const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function useChatbotContext() {
    const context = useContext(ChatbotContext);
    if (context === undefined) {
        throw new Error('useChatbotContext must be used within a ChatbotProvider');
    }
    return context;
}

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [productContext, setProductContext] = useState<ProductContext>(null);

  const value = { productContext, setProductContext };

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
}
