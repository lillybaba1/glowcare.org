
'use client'; // This must be a client component to use hooks

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, PlusCircle, Sparkles, Loader2, Package, Palette } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-headline">GlowCare</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin">
                        <LayoutDashboard />
                        Dashboard
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/orders">
                        <Package />
                        Orders
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/products">
                        <ShoppingBag />
                        Products
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/add-product">
                        <PlusCircle />
                        Add Product
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/appearance">
                        <Palette />
                        Appearance
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                 <SidebarTrigger className="sm:hidden" />
                 <h1 className="text-xl font-semibold">Admin Panel</h1>
            </header>
            <main className="p-4 sm:px-6 sm:py-0">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
