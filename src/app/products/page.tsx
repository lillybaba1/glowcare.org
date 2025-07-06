import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Our full product catalog with search and filtering will be available here soon. Stay tuned!</p>
        </CardContent>
      </Card>
    </div>
  );
}
