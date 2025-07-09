
'use client';

import { notFound, useRouter, useParams, useSearchParams } from 'next/navigation';
import { getOrderById, updateOrderStatus } from '@/lib/data';
import { useEffect, useState, Suspense } from 'react';
import type { Order, OrderStatus, PaymentStatus } from '@/lib/types';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Phone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
        case 'processing':
            return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
        case 'shipped':
            return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shipped</Badge>;
        case 'completed':
            return <Badge variant="secondary" className="bg-green-200 text-green-800 hover:bg-green-200">Completed</Badge>;
        case 'cancelled':
            return <Badge variant="destructive">Cancelled</Badge>;
        case 'paid':
             return <Badge variant="secondary" className="bg-green-200 text-green-800 hover:bg-green-200">Paid</Badge>;
        case 'unpaid':
             return <Badge variant="secondary" className="bg-red-200 text-red-800 hover:bg-red-200">Unpaid</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const userId = searchParams.get('userId');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Unpaid');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!id || !userId) return;

    async function fetchOrder() {
      const fetchedOrder = await getOrderById(id, userId);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
        setOrderStatus(fetchedOrder.orderStatus);
        setPaymentStatus(fetchedOrder.paymentStatus);
      } else {
        notFound();
      }
      setIsLoading(false);
    }
    fetchOrder();
  }, [id, userId]);

  const handleStatusUpdate = async () => {
      if (!order || !userId) return;
      setIsUpdating(true);
      try {
        await updateOrderStatus(order.id, userId, { orderStatus, paymentStatus });
        toast({
            title: "Status Updated",
            description: "The order status has been successfully updated.",
        });
        const updatedOrder = await getOrderById(order.id, userId);
        if (updatedOrder) {
            setOrder(updatedOrder);
        }
      } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not update the order status.",
        });
      } finally {
        setIsUpdating(false);
      }
  };


  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!order) {
    return notFound();
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Order Details
            </h1>
            <Badge variant="outline" className="ml-auto sm:ml-0 font-mono">
                #{order.orderNumber}
            </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                        <CardDescription>
                            Date: {new Date(order.createdAt).toLocaleString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                            <div className="relative h-10 w-10 flex-shrink-0">
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
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <p><strong>Name:</strong> {order.customer.name}</p>
                        <div className="flex items-center gap-2">
                           <strong>Phone:</strong> 
                           <span>{order.customer.phone}</span>
                           <Button asChild variant="outline" size="icon" className="h-7 w-7">
                                <a href={`tel:${order.customer.phone}`} aria-label="Call customer">
                                    <Phone className="h-4 w-4" />
                                </a>
                           </Button>
                        </div>
                        <p><strong>Address:</strong> {order.customer.address}</p>
                    </CardContent>
                </Card>
                 {order.customer.idFrontUrl && order.customer.idBackUrl && (
                     <Card>
                        <CardHeader>
                            <CardTitle>ID Verification Images</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="font-medium text-sm">Front of ID</p>
                                <Link href={order.customer.idFrontUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full rounded-lg border overflow-hidden">
                                    <Image src={order.customer.idFrontUrl} alt="Front of ID" fill className="object-contain" />
                                </Link>
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium text-sm">Back of ID</p>
                                <Link href={order.customer.idBackUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full rounded-lg border overflow-hidden">
                                     <Image src={order.customer.idBackUrl} alt="Back of ID" fill className="object-contain" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Update Status</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="order-status">Order Status</Label>
                            <Select value={orderStatus} onValueChange={(v) => setOrderStatus(v as OrderStatus)}>
                                <SelectTrigger id="order-status" aria-label="Select order status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Shipped">Shipped</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="payment-status">Payment Status</Label>
                            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                                <SelectTrigger id="payment-status" aria-label="Select payment status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleStatusUpdate} disabled={isUpdating} className="w-full">
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Order
                         </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Order Totals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span>Total Items</span>
                            <span>{totalItems}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Payment Method</span>
                            <span className="font-medium uppercase">{order.paymentMethod}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Grand Total</span>
                            <span>GMD {order.total.toFixed(2)}</span>
                        </div>
                         <Separator />
                         <div className="flex justify-between items-center">
                            <span>Current Order Status</span>
                            {getStatusBadge(order.orderStatus)}
                         </div>
                         <div className="flex justify-between items-center">
                            <span>Current Payment Status</span>
                            {getStatusBadge(order.paymentStatus)}
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <OrderDetailsContent />
    </Suspense>
  );
}
