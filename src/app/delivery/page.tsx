import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the delivery information page. Details about shipping options, costs, and times will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
