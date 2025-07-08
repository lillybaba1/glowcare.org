
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { ShoppingBag, DollarSign, Package, Loader2 } from "lucide-react";
import type { Order, Product } from "@/lib/types";

export default function AdminDashboardPage() {
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const productsRef = ref(db, 'products');
        const ordersRef = ref(db, 'orders');

        let productsLoaded = false;
        let ordersLoaded = false;

        const checkAllDataLoaded = () => {
            if (productsLoaded && ordersLoaded) {
                setIsLoading(false);
            }
        };
        
        const productsUnsubscribe = onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                setTotalProducts(Object.keys(snapshot.val()).length);
            } else {
                setTotalProducts(0);
            }
            productsLoaded = true;
            checkAllDataLoaded();
        }, (error) => {
            console.error("Firebase products read failed:", error);
            productsLoaded = true;
            checkAllDataLoaded();
        });

        const ordersUnsubscribe = onValue(ordersRef, (snapshot) => {
            if (snapshot.exists()) {
                const ordersObject = snapshot.val();
                const ordersArray: Order[] = Object.keys(ordersObject).map(key => ({
                    id: key,
                    ...ordersObject[key],
                }));
                
                const sales = ordersArray
                    .filter(order => order.orderStatus === 'Completed')
                    .reduce((sum, order) => sum + order.total, 0);
                setTotalSales(sales);

                const pending = ordersArray.filter(order => order.orderStatus === 'Pending').length;
                setPendingOrders(pending);
            } else {
                setTotalSales(0);
                setPendingOrders(0);
            }
            ordersLoaded = true;
            checkAllDataLoaded();
        }, (error) => {
            console.error("Firebase orders read failed:", error);
            ordersLoaded = true;
            checkAllDataLoaded();
        });

        // Cleanup function to detach listeners on component unmount
        return () => {
            productsUnsubscribe();
            ordersUnsubscribe();
        };
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
