
'use client';

import Link from 'next/link';
import { LogOut, Menu, ShoppingBag, Sparkles, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import CartSheet from '@/components/cart/CartSheet';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQs' },
];

export default function Header() {
  const { cartCount } = useCart();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-7 w-7 text-primary" />
          <span className="font-headline">GlowCare Gambia</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} className="text-base font-medium hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
           <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-7 w-7" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
           </CartSheet>

            {user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1 p-1">
                                <p className="text-base font-medium leading-none">My Account</p>
                                <p className="text-sm leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-base p-2 cursor-pointer">
                            <Link href="/account/orders">
                                <Package className="mr-2 h-5 w-5" />
                                <span>My Orders</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="text-base p-2 cursor-pointer">
                            <LogOut className="mr-2 h-5 w-5" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button asChild variant="ghost" className="text-base">
                    <Link href="/login">Login</Link>
                </Button>
            )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <SheetHeader>
                <SheetTitle className="sr-only">Main Menu</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
                  <Sparkles className="h-7 w-7 text-primary" />
                  <span className="font-headline">GlowCare Gambia</span>
                </Link>
                <nav className="grid gap-4">
                  {navLinks.map(link => (
                    <Link key={link.label} href={link.href} className="text-xl font-medium hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ))}
                   {!user && (
                     <Link href="/login" className="text-xl font-medium hover:text-primary transition-colors">Login</Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
