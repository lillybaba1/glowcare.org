
'use client';

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { Order } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const ordersRef = ref(db, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            if (snapshot.exists()) {
                const ordersObject = snapshot.val();
                const ordersArray = Object.keys(ordersObject).map(key => ({
                    id: key,
                    ...ordersObject[key],
                }));
                setOrders(ordersArray.reverse());
            } else {
                setOrders([]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
    
    if (isLoading) {
        return (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                    View and manage all customer orders.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.customer.name}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {order.customer.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">GMD {order.total.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                                    <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                                    <TableCell>
                                      {/* Future: <Button asChild size="sm" variant="outline"><Link href={`/admin/orders/${order.id}`}>View</Link></Button> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
