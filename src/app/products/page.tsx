
import ProductCard from '@/components/products/ProductCard';
import { getProducts, categories } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductFilters from '@/components/products/ProductFilters';
import type { Product } from '@/lib/types';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function ProductGrid({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const selectedCategory = searchParams?.category as string | undefined;

  return (
    <div className="grid md:grid-cols-4 gap-8 items-start">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Filter by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductFilters categories={categories} />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-3">
        <Suspense fallback={<GridSkeleton />}>
          <ProductList selectedCategory={selectedCategory} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductList({ selectedCategory }: { selectedCategory?: string }) {
  const allProducts = await getProducts();

  const filteredProducts = selectedCategory
    ? allProducts.filter(
        (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : allProducts;

  // Capitalize first letter for display
  const displayCategory = selectedCategory
    ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
    : 'All Products';

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{displayCategory}</h1>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}

const GridSkeleton = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Loading Products...</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                 <Card key={i} className="flex flex-col overflow-hidden h-full">
                     <div className="relative h-64 w-full bg-muted animate-pulse"></div>
                     <CardContent className="p-4 flex-grow">
                         <div className="h-5 w-3/4 bg-muted animate-pulse rounded"></div>
                         <div className="h-6 w-1/2 bg-muted animate-pulse rounded mt-2"></div>
                     </CardContent>
                     <CardFooter className="p-4 pt-0">
                         <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                     </CardFooter>
                 </Card>
            ))}
        </div>
    </div>
);

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <ProductGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
