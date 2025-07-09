
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid md:grid-cols-4 gap-8 items-start">
        <nav className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4">My Account</h2>
              <ul className="space-y-2">
                <li>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/account/orders">My Orders</Link>
                  </Button>
                </li>
                {/* Add more account links here in the future */}
              </ul>
            </CardContent>
          </Card>
        </nav>
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
