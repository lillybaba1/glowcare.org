
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Plus, XCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock !== undefined && product.stock === 0;
  const imageUrl = product.imageUrls?.[0] || 'https://placehold.co/400x400.png';

  return (
    <Card className="flex flex-col overflow-hidden h-full group">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block relative h-48 sm:h-64 w-full">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              data-ai-hint="skincare product"
            />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-base font-medium mb-1">
          <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <p className="text-lg font-semibold text-primary">GMD {product.price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => addToCart(product)} disabled={isOutOfStock}>
            {isOutOfStock ? (
                <>
                    <XCircle className="mr-2 h-4 w-4" /> Out of Stock
                </>
            ) : (
                <>
                    <Plus className="mr-2 h-4 w-4" /> Add to Cart
                </>
            )}
        </Button>
      </CardFooter>
    </Card>
  );
}
