
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts, getOrders } from "@/lib/data";
import { ShoppingBag, DollarSign, Package } from "lucide-react";

export default async function AdminDashboardPage() {
    const products = await getProducts();
    const orders = await getOrders();

    const totalProducts = products.length;

    const totalSales = orders
        .filter(order => order.orderStatus === 'Completed')
        .reduce((sum, order) => sum + order.total, 0);

    const pendingOrders = orders.filter(order => order.orderStatus === 'Pending').length;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
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
            <Card>
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
             <Card>
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
        </div>
    );
}
