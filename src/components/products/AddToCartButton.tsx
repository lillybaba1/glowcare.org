'use client';

import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Button size="lg" className="w-full" onClick={() => addToCart(product)}>
      <Plus className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  );
}
