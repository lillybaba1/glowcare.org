import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the privacy policy page. Information about how user data is collected, used, and protected will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
