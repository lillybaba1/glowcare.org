
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageContent } from "@/lib/data";

export default async function ContactPage() {
  const content = await getPageContent('contact');

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
        </CardContent>
      </Card>
    </div>
  );
}
