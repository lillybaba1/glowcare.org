import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold">
            🌿 About GlowCare Gambia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-base md:text-lg text-muted-foreground max-w-4xl mx-auto">
          <p>
            At GlowCare Gambia, we believe healthy, glowing skin should be accessible to everyone. We are The Gambia’s trusted online skincare and wellness store, bringing you authentic, dermatologist-recommended products like CeraVe, Nivea, sunscreens, and more, directly to your doorstep.
          </p>
          <p>
            We know how challenging it can be to find high-quality skincare products locally, which is why we carefully source our products and offer them at fair, transparent prices. Whether you are looking to treat dry skin, protect your skin from the sun, or build a consistent skincare routine, GlowCare Gambia is here to support your journey towards healthier skin.
          </p>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">Why Choose Us?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">✅</span>
                <div>
                  <strong className="font-semibold text-foreground">Authenticity Guaranteed:</strong> We only sell original products from trusted suppliers.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">✅</span>
                <div>
                  <strong className="font-semibold text-foreground">Convenient Payment:</strong> Pay easily with Wave, cash on delivery, or card.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">✅</span>
                <div>
                  <strong className="font-semibold text-foreground">Fast Delivery:</strong> We deliver across The Gambia with care and efficiency.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">✅</span>
                <div>
                  <strong className="font-semibold text-foreground">Customer Support:</strong> Have questions? Our team is ready to guide you in finding the right products for your skin.
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">Our Mission</h3>
            <p>
              To empower Gambians with the confidence that comes from healthy, glowing skin by making high-quality skincare accessible, affordable, and simple to order.
            </p>
          </div>

          <div className="text-center pt-6 border-t space-y-4">
             <p>
              Join us in building a community that values self-care, wellness, and confidence.
            </p>
            <p>
              📲 Follow us on WhatsApp and Instagram for skincare tips, promotions, and updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
