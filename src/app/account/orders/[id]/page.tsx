
'use client';

import { notFound, useParams } from 'next/navigation';
import { getOrderById } from '@/lib/data';
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
        case 'processing': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
        case 'shipped': return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shipped</Badge>;
        case 'completed': return <Badge variant="secondary" className="bg-green-200 text-green-800 hover:bg-green-200">Completed</Badge>;
        case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
        case 'paid': return <Badge variant="secondary" className="bg-green-200 text-green-800 hover:bg-green-200">Paid</Badge>;
        case 'unpaid': return <Badge variant="secondary" className="bg-red-200 text-red-800 hover:bg-red-200">Unpaid</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export default function UserOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      notFound();
      return;
    }

    async function fetchOrder() {
      const fetchedOrder = await getOrderById(id);
      // Security check: Make sure the logged-in user is the one who owns this order
      if (fetchedOrder && fetchedOrder.customer.userId === user?.uid) {
        setOrder(fetchedOrder);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setIsLoading(false);
    }
    fetchOrder();
  }, [id, user, authLoading]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!isAuthorized) {
    return notFound();
  }

  if (!order) {
    return notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>
            Order ID: <span className="font-mono text-xs">{order.id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Order Status:</strong> {getStatusBadge(order.orderStatus)}</p>
            <p><strong>Payment Status:</strong> {getStatusBadge(order.paymentStatus)}</p>
        </div>
        <Separator />
        <div>
            <h3 className="text-lg font-semibold mb-2">Items Ordered</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {order.items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <div className="flex items-center gap-4">
                                <div className="relative h-12 w-12 flex-shrink-0">
                                  <Image src={item.imageUrl} alt={item.name} fill className="rounded-md object-cover" />
                                </div>
                                <span>{item.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">GMD {item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">GMD {(item.price * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <Separator />
        <div className="flex justify-end font-bold text-xl">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span>Total:</span>
                <span className="text-right">GMD {order.total.toFixed(2)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
