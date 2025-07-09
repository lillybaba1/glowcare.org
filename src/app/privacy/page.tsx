
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageContent } from "@/lib/data";

export default async function PrivacyPage() {
  const content = await getPageContent('privacy');

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
        </CardContent>
      </Card>
    </div>
  );
}
