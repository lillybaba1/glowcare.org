
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductCard from '@/components/products/ProductCard';
import { getProducts, categories, getHeroImageUrl, getHeroBackgroundColor } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.filter(p => p.featured);
  const heroImageUrl = await getHeroImageUrl();
  const heroBgColor = await getHeroBackgroundColor();
  const defaultHeroImage = "https://images.unsplash.com/photo-1663429312696-307edaa85c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxnYW1iaWF8ZW58MHx8fHwxNzUxOTA3MjM0fDA&ixlib=rb-4.1.0&q=80&w=1080";

  const heroStyle: React.CSSProperties = {
    // The background color will be a fallback if the image fails to load or isn't set
    backgroundColor: heroBgColor || 'hsl(var(--primary))',
  };

  const finalHeroImageUrl = heroImageUrl || defaultHeroImage;
  if (finalHeroImageUrl) {
    heroStyle.backgroundImage = `url(${finalHeroImageUrl})`;
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative w-full bg-cover bg-center bg-no-repeat py-20 md:py-32"
        style={heroStyle}
      >
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="relative container mx-auto px-4 md:px-6 text-center text-primary-foreground">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-white">
              Authentic Skincare for a Radiant You
            </h1>
            <p className="text-lg text-white/80">
              Discover genuine, affordable skincare and wellness products in The Gambia.
              Shine with confidence.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/products">Shop All Products</Link>
              </Button>
            </div>
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
