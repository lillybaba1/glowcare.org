
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    id: "faq-1",
    question: "Are your products original?",
    answer:
      "Yes! We only sell authentic, dermatologist-recommended products sourced directly from trusted suppliers.",
  },
  {
    id: "faq-2",
    question: "How can I pay?",
    answer:
      "You can pay with Wave, cash on delivery, or card payments (via Flutterwave/Stripe).",
  },
  {
    id: "faq-3",
    question: "Do you deliver across The Gambia?",
    answer:
      "Yes, we deliver to all regions. Delivery fees may vary depending on your location.",
  },
  {
    id: "faq-4",
    question: "How long does delivery take?",
    answer:
      "Delivery within the Kombos usually takes 1–2 days, while upcountry deliveries may take 2–4 days.",
  },
  {
    id: "faq-5",
    question: "Can I return a product?",
    answer:
      "We accept returns for unopened and unused products within 3 days of delivery if there is an issue with your order.",
  },
  {
    id: "faq-6",
    question: "How can I contact you?",
    answer:
      "You can message us on WhatsApp or Instagram, or use the contact form on our website.",
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold">
            ❓ Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-lg text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
