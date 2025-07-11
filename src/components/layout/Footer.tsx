
'use client';

import Link from 'next/link';
import { Sparkles, Instagram, Facebook, Twitter } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { getSocialMediaUrls, getCategories } from '@/lib/data';
import type { Category } from '@/lib/types';

export default function Footer() {
  const { isAdmin } = useAuth();
  const [socialUrls, setSocialUrls] = useState({
    facebook: '#',
    instagram: '#',
    twitter: '#',
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchFooterData() {
      const urls = await getSocialMediaUrls();
      setSocialUrls(urls);
      const cats = await getCategories();
      setCategories(cats);
    }
    fetchFooterData();
  }, []);

  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-1">
             <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-headline">GlowCare Gambia</span>
            </Link>
            <p className="text-sm">Authentic skincare and wellness products delivered to your doorstep in The Gambia.</p>
            <div className="flex gap-4 mt-2">
              <Link href={socialUrls.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-6 w-6 hover:text-primary transition-colors" />
              </Link>
              <Link href={socialUrls.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-6 w-6 hover:text-primary transition-colors" />
              </Link>
              <Link href={socialUrls.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="h-6 w-6 hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Shop</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                {categories.slice(0, 3).map((category) => (
                    <li key={category.id}>
                        <Link href={`/products?category=${category.name.toLowerCase()}`} className="hover:text-primary transition-colors">
                            {category.name}
                        </Link>
                    </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link href="/delivery" className="hover:text-primary transition-colors">Delivery Info</Link></li>
                <li><Link href="/returns" className="hover:text-primary transition-colors">Return Policy</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                {isAdmin && (
                  <>
                    <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
                    <li><Link href="/admin/appearance" className="hover:text-primary transition-colors">Appearance</Link></li>
                  </>
                )}
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
