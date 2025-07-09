
'use client';

import { useState, useEffect } from "react";
import { fetchAdminOrders } from "@/lib/fetchOrders";
import type { Order } from "@/lib/types";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                const allOrders = await fetchAdminOrders();
                setOrders(allOrders);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Failed to load orders",
                    description: error.message || "There was a problem fetching all orders.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, [toast]);

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
                            <TableHead className="text-center">Items</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? (
                            orders.map((order) => {
                                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                                return (
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
                                    <TableCell className="text-center">{totalItems}</TableCell>
                                    <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                                    <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                                    <TableCell className="text-right">
                                      <Button asChild size="sm" variant="outline"><Link href={`/admin/orders/${order.id}?userId=${order.customer.userId}`}>View</Link></Button>
                                    </TableCell>
                                </TableRow>
                            )})
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
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
