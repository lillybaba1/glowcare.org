import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddProductForm from "@/components/admin/AddProductForm";

export default function AddProductPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold">
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
