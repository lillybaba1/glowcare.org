
'use client';

import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProductById } from '@/lib/data';
import type { Product } from '@/lib/types';

import AddProductForm from "@/components/admin/AddProductForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await getProductById(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
        <CardDescription>
          Update the details for "{product.name}".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AddProductForm productToEdit={product} />
      </CardContent>
    </Card>
  );
}
