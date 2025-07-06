'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';

import { getProductById } from '@/lib/data';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();

  // In a real app with a database, this data would be fetched from the server.
  // For our in-memory solution, we fetch it here. Because of how server actions
  // and client components work, a full page navigation (like the redirect
  // after adding a product) is needed to ensure this page gets the latest data.
  const product = getProductById(Array.isArray(id) ? id[0] : id);

  if (!product) {
    notFound();
    return null;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint="skincare product"
            />
          </div>
          <div className="flex flex-col p-6 md:p-8">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl lg:text-4xl font-bold">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow mt-4">
              <p className="text-3xl font-bold text-primary mb-4">GMD {product.price.toFixed(2)}</p>
              <Separator className="my-4" />
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <CardDescription className="text-base text-muted-foreground space-y-4">
                {product.description}
              </CardDescription>
            </CardContent>
            <div className="mt-6 pt-6 border-t">
                <Button size="lg" className="w-full" onClick={() => addToCart(product)}>
                    <Plus className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
