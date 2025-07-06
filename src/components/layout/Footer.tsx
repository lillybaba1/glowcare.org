import Link from 'next/link';
import { Sparkles, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4">
             <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-headline">GlowCare Gambia</span>
            </Link>
            <p className="text-sm">Authentic skincare and wellness products delivered to your doorstep in The Gambia.</p>
            <div className="flex gap-4 mt-2">
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-6 w-6 hover:text-primary transition-colors" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-6 w-6 hover:text-primary transition-colors" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-6 w-6 hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Shop</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link href="/products?category=sunscreens" className="hover:text-primary transition-colors">Sunscreens</Link></li>
                <li><Link href="/products?category=cleansers" className="hover:text-primary transition-colors">Cleansers</Link></li>
                <li><Link href="/products?category=moisturizers" className="hover:text-primary transition-colors">Moisturizers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Delivery Info</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Return Policy</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm">
          <p>&copy; {new Date().getFullYear()} GlowCare Gambia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
