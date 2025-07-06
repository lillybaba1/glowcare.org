import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Our secure checkout with delivery/pickup options and multiple payment methods will be here soon. Thank you for your patience!</p>
        </CardContent>
      </Card>
    </div>
  );
}
