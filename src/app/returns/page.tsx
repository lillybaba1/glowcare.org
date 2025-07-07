import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Return Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the return policy page. Details about product returns, exchanges, and refunds will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
