
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts, getOrders } from "@/lib/data";
import { ShoppingBag, DollarSign, Package, Loader2 } from "lucide-react";
import type { Order } from "@/lib/types";
import type { Product } from "@/lib/types";

export default function AdminDashboardPage() {
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const products: Product[] = await getProducts();
                const orders: Order[] = await getOrders();

                setTotalProducts(products.length);

                const sales = orders
                    .filter(order => order.orderStatus === 'Completed')
                    .reduce((sum, order) => sum + order.total, 0);
                setTotalSales(sales);

                const pending = orders.filter(order => order.orderStatus === 'Pending').length;
                setPendingOrders(pending);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);


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
