
'use client';

import { useCart } from '@/hooks/use-cart';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, push, set, runTransaction } from 'firebase/database';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(2, { message: 'Full name is required' }),
  phone: z.string().min(7, { message: 'A valid phone number is required' }),
  address: z.string().min(10, { message: 'Delivery address is required' }),
  paymentMethod: z.enum(['wave', 'cod'], {
    required_error: 'You need to select a payment method.',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login?redirect=/checkout');
      } else if (cartCount === 0) {
        router.replace('/products');
      }
    }
  }, [user, authLoading, cartCount, router]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    
    const orderData = {
      customer: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        userId: user?.uid,
      },
      items: cartItems,
      total: cartTotal,
      paymentMethod: data.paymentMethod,
      orderStatus: 'Pending' as const,
      paymentStatus: 'Unpaid' as const,
      createdAt: Date.now(),
    };

    try {
      // 1. Save the order to the database
      const newOrderRef = push(ref(db, 'orders'));
      await set(newOrderRef, orderData);

      // 2. Atomically update stock for each product
      for (const item of cartItems) {
        const productRef = ref(db, `products/${item.id}`);
        await runTransaction(productRef, (product) => {
          if (product && typeof product.stock === 'number') {
            // Ensure we don't go below zero
            product.stock = Math.max(0, product.stock - item.quantity);
          }
          return product;
        });
      }

      toast({
        title: 'Order Placed!',
        description: 'Thank you for your purchase. We have received your order.',
      });

      clearCart();
      router.push('/');
    } catch (error) {
        console.error("Failed to place order:", error);
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: "There was an issue placing your order. Please try again.",
        });
        setIsSubmitting(false);
    }
  };
  
  if (authLoading || !user || cartCount === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lamin B. Touray" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 220-XXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kairaba Avenue, Serekunda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                       <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <RadioGroupItem value="wave" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Wave Money Transfer
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <RadioGroupItem value="cod" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Cash on Delivery
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="pt-4" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium leading-tight">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-right">GMD {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>GMD {cartTotal.toFixed(2)}</span>
                </div>
                <Separator />
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
