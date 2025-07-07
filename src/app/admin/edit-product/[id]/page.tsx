
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/data';
import AddProductForm from "@/components/admin/AddProductForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

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
