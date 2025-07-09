
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Package, Loader2 } from "lucide-react";
import { getProducts } from "@/lib/data";
import { fetchAdminOrders } from "@/lib/fetchOrders";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";

export default function AdminDashboardPage() {
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [products, allOrders] = await Promise.all([
                    getProducts(),
                    fetchAdminOrders()
                ]);

                setTotalProducts(products.length);

                if (allOrders.length > 0) {
                     const sales = allOrders
                        .filter(order => order.orderStatus === 'Completed')
                        .reduce((sum, order) => sum + order.total, 0);
                    setTotalSales(sales);

                    const pending = allOrders.filter(order => order.orderStatus === 'Pending').length;
                    setPendingOrders(pending);
                } else {
                    setTotalSales(0);
                    setPendingOrders(0);
                }

            } catch (error: any) {
                console.error("Failed to fetch dashboard data:", error);
                toast({
                    variant: "destructive",
                    title: "Failed to load dashboard data",
                    description: error.message || "There was a problem fetching dashboard statistics.",
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [toast]);


    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/products">
                <Card className="transition-colors hover:bg-muted/80 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently in your store
                        </p>
                    </CardContent>
                </Card>
            </Link>
            <Link href="/admin/orders">
                 <Card className="transition-colors hover:bg-muted/80 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">GMD {totalSales.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on completed orders
                        </p>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/admin/orders">
                <Card className="transition-colors hover:bg-muted/80 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Ready for processing
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
