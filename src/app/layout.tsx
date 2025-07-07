
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartProvider';
import { AuthProvider } from '@/context/AuthProvider';
import SiteLayout from '@/components/layout/SiteLayout';

export const metadata: Metadata = {
  title: 'GlowCare Gambia - Authentic Skincare & Wellness',
  description: 'Affordable, authentic skincare and wellness products in The Gambia. CeraVe, Nivea, sunscreens, and more. Delivery and pickup available.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            <SiteLayout>{children}</SiteLayout>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
