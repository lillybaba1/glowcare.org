
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductCard from '@/components/products/ProductCard';
import { getProducts, categories, getHeroImageUrl, getHeroBackgroundColor, getHeroBackgroundImageUrl } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.filter(p => p.featured);
  const foregroundImageUrl = await getHeroImageUrl();
  const backgroundImageUrl = await getHeroBackgroundImageUrl();
  const heroBgColor = await getHeroBackgroundColor();
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative w-full py-20 md:py-32"
        style={!backgroundImageUrl ? { backgroundColor: heroBgColor || 'hsl(var(--background))' } : {}}
      >
        {backgroundImageUrl && (
          <>
            <Image
              src={backgroundImageUrl}
              alt="Hero background"
              fill
              className="object-cover w-full h-full"
              aria-hidden="true"
              priority
            />
            <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
          </>
        )}

        <div className="relative container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-center md:text-left">
              <h1 className={cn(
                "text-4xl md:text-5xl font-headline font-bold tracking-tight",
                backgroundImageUrl ? "text-white" : "text-foreground"
              )}>
                Authentic Skincare for a Radiant You
              </h1>
              <p className={cn(
                "text-lg",
                backgroundImageUrl ? "text-neutral-200" : "text-primary-foreground/80"
              )}>
                Discover genuine, affordable skincare and wellness products in The Gambia.
                Shine with confidence.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/products">Shop All Products</Link>
                </Button>
              </div>
            </div>
            {foregroundImageUrl && (
               <div className="relative h-80 w-full">
                <Image
                  src={foregroundImageUrl}
                  alt="Skincare products on display"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  data-ai-hint="skincare products"
                  sizes="(max-width: 768px) 80vw, 40vw"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-headline font-bold">Featured Products</h2>
            <Button variant="link" asChild>
              <Link href="/products">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="bg-accent py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-headline font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {categories.map(category => (
              <Link key={category.id} href={`/products?category=${category.name.toLowerCase()}`} passHref>
                <Card className="group overflow-hidden text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="p-0">
                    <div className="relative h-48">
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={category.name}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
