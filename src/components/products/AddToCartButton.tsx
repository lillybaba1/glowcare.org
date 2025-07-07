
'use client';

import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, XCircle } from 'lucide-react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  if (isOutOfStock) {
    return (
      <Button size="lg" className="w-full" disabled>
        <XCircle className="mr-2 h-5 w-5" />
        Out of Stock
      </Button>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={() => addToCart(product)}>
      <Plus className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  );
}
