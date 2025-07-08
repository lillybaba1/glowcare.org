
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { getProductById, getProducts } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductViewContextSetter from '@/components/products/ProductViewContextSetter';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/products/ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const getStockBadge = (stock?: number) => {
  if (stock === undefined || stock === null) {
    return null;
  }
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock < 10) {
    return <Badge variant="secondary" className="bg-orange-200 text-orange-800 hover:bg-orange-200">Low Stock</Badge>;
  }
  return <Badge variant="secondary" className="bg-green-200 text-green-800 hover:bg-green-200">In Stock</Badge>;
};


export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = await getProductById(id);

  if (!product || !product.imageUrls || product.imageUrls.length === 0) {
    notFound();
    return null;
  }
  
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <ProductViewContextSetter product={product} />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square bg-muted p-4 md:p-6">
               <Carousel className="w-full h-full">
                  <CarouselContent>
                    {product.imageUrls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square h-full w-full">
                          <Image
                            src={url}
                            alt={`${product.name} image ${index + 1}`}
                            fill
                            className="object-contain rounded-md"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            data-ai-hint="skincare product"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-2" />
                  <CarouselNext className="absolute right-2" />
                </Carousel>
            </div>
            <div className="flex flex-col p-6 md:p-8 lg:p-10">
              <div className="flex-grow">
                <CardHeader className="p-0">
                  <CardTitle className="text-3xl lg:text-4xl font-bold">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <p className="text-3xl font-bold text-primary">GMD {product.price.toFixed(2)}</p>
                    {getStockBadge(product.stock)}
                  </div>
                  <Separator className="my-6" />
                  <h3 className="text-xl font-semibold mb-2">Description</h3>
                  <CardDescription className="text-base text-muted-foreground space-y-4">
                    {product.description}
                  </CardDescription>
                </CardContent>
              </div>
              <div className="mt-6 pt-6 border-t">
                  <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </Card>
        
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
