
'use client';

import { useContext, useEffect } from 'react';
import { ChatbotContext } from '@/context/ChatbotProvider';
import type { Product } from '@/lib/types';

export default function ProductViewContextSetter({ product }: { product: Product | null }) {
  const context = useContext(ChatbotContext);

  if (!context) {
    return null;
  }
  
  const { setProductContext } = context;

  useEffect(() => {
    if (product) {
      setProductContext({ name: product.name, description: product.description });
    }
    
    // Clear context on unmount
    return () => {
      setProductContext(null);
    };
  }, [product, setProductContext]);

  return null; // This component does not render anything
}
