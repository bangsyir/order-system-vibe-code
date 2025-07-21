import { useState } from "react";
import { useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Calendar, Download, DollarSign, ShoppingBag, TrendingUp, FileText } from "lucide-react";
import type { Route } from "./+types/admin.sales";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const selectedDate = url.searchParams.get("date") || new Date().toISOString().split('T')[0];

    // Get start and end of selected day
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get completed orders for the selected day
    const dailyOrders = await prisma.order.findMany({
        where: {
            status: "COMPLETED",
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            customer: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Calculate daily statistics
    const totalRevenue = dailyOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = dailyOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate order type breakdown
    const dineInOrders = dailyOrders.filter(order => order.orderType === "DINE_IN").length;
    const takeawayOrders = dailyOrders.filter(order => order.orderType === "TAKEAWAY").length;

    // Get top selling products
    const productSales = new Map();
    dailyOrders.forEach(order => {
        order.items.forEach(item => {
            const key = item.product.name;
            if (productSales.has(key)) {
                const existing = productSales.get(key);
                productSales.set(key, {
                    ...existing,
                    quantity: existing.quantity + item.quantity,
                    revenue: existing.revenue + (item.price * item.quantity),
                });
            } else {
                productSales.set(key, {
                    name: item.product.name,
                    quantity: item.quantity,
                    revenue: item.price * item.quantity,
                });
            }
        });
    });

    const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // Get hourly breakdown
    const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
        const hourStart = new Date(selectedDate);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(selectedDate);
        hourEnd.setHours(hour, 59, 59, 999);

        const hourOrders = dailyOrders.filter(order => {
            const orderTime = new Date(order.createdAt);
            return orderTime >= hourStart && orderTime <= hourEnd;
        });

        return {
            hour: `${hour.toString().padStart(2, '0')}:00`,
            orders: hourOrders.length,
            revenue: hourOrders.reduce((sum, order) => sum + order.total, 0),
        };
    }).filter(hour => hour.orders > 0);

    return {
        selectedDate,
        dailyOrders,
        statistics: {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            dineInOrders,
            takeawayOrders,
        },
        topProducts,
        hourlyBreakdown,
    };
}

export default function AdminSales({ loaderData }: Route.ComponentProps) {
    const { selectedDate, dailyOrders, statistics, topProducts, hourlyBreakdown } = loaderData;
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const generatePDF = async () => {
        setIsGeneratingPDF(true);

        try {
            // Dynamic import to avoid SSR issues
            const { default: jsPDF } = await import('jspdf');

            // Type assertion to handle the module import
            const doc = new (jsPDF as any)();

            // Header
            doc.setFontSize(20);
            doc.text('Bistro Express - Daily Sales Report', 20, 20);

            doc.setFontSize(12);
            doc.text(`Date: ${new Date(selectedDate).toLocaleDateString()}`, 20, 35);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);

            // Summary Statistics
            doc.setFontSize(16);
            doc.text('Daily Summary', 20, 65);

            let yPosition = 75;
            doc.setFontSize(12);

            const summaryItems = [
                `Total Revenue: $${statistics.totalRevenue.toFixed(2)}`,
                `Total Orders: ${statistics.totalOrders}`,
                `Average Order Value: $${statistics.averageOrderValue.toFixed(2)}`,
                `Dine-In Orders: ${statistics.dineInOrders}`,
                `Takeaway Orders: ${statistics.takeawayOrders}`,
            ];

            summaryItems.forEach(item => {
                doc.text(item, 20, yPosition);
                yPosition += 10;
            });

            // Top Products
            if (topProducts.length > 0) {
                yPosition += 20;
                doc.setFontSize(16);
                doc.text('Top Selling Products', 20, yPosition);
                yPosition += 15;
                doc.setFontSize(12);

                topProducts.forEach((product, index) => {
                    doc.text(`${index + 1}. ${product.name} - ${product.quantity} sold - $${product.revenue.toFixed(2)}`, 20, yPosition);
                    yPosition += 10;
                });
            }

            // Order Details
            if (dailyOrders.length > 0) {
                doc.addPage();
                doc.setFontSize(16);
                doc.text('Order Details', 20, 20);

                let orderY = 35;
                doc.setFontSize(10);

                dailyOrders.forEach((order: any) => {
                    if (orderY > 270) { // Start new page if needed
                        doc.addPage();
                        orderY = 20;
                    }

                    const orderInfo = `#${order.id.slice(-6)} | ${new Date(order.createdAt).toLocaleTimeString()} | ${order.orderType.replace('_', ' ')} | Table: ${order.tableNumber || 'N/A'} | $${order.total.toFixed(2)}`;
                    doc.text(orderInfo, 20, orderY);
                    orderY += 8;

                    // Order items
                    order.items.forEach((item: any) => {
                        doc.text(`  - ${item.quantity}x ${item.product.name} ($${(item.price * item.quantity).toFixed(2)})`, 25, orderY);
                        orderY += 6;
                    });
                    orderY += 5; // Space between orders
                });

                // Total at the end
                orderY += 10;
                doc.setFontSize(14);
                doc.text(`TOTAL REVENUE: $${statistics.totalRevenue.toFixed(2)}`, 20, orderY);
            }

            // Save the PDF
            const fileName = `sales-report-${selectedDate}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sales Report</h2>
                    <p className="text-gray-600">Daily sales summary and order details</p>
                </div>
                <div className="flex gap-4 items-center">
                    <form method="get" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <input
                            type="date"
                            name="date"
                            defaultValue={selectedDate}
                            onChange={(e) => {
                                const form = e.target.form;
                                if (form) form.submit();
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </form>
                    <div className="flex gap-2">
                        <Button
                            onClick={generatePDF}
                            disabled={isGeneratingPDF || dailyOrders.length === 0}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
                        </Button>
                        <Button
                            onClick={() => window.print()}
                            disabled={dailyOrders.length === 0}
                            variant="outline"
                            className="print:hidden"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${statistics.totalRevenue.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            {statistics.dineInOrders} dine-in, {statistics.takeawayOrders} takeaway
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${statistics.averageOrderValue.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">100%</div>
                        <p className="text-xs text-muted-foreground">
                            Completed orders only
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Best performing items today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topProducts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No sales data available</p>
                        ) : (
                            <div className="space-y-3">
                                {topProducts.map((product, index) => (
                                    <div key={product.name} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium">{product.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{product.quantity} sold</div>
                                            <div className="text-sm text-gray-600">
                                                ${product.revenue.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Hourly Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hourly Breakdown</CardTitle>
                        <CardDescription>Sales distribution throughout the day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hourlyBreakdown.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hourly data available</p>
                        ) : (
                            <div className="space-y-3">
                                {hourlyBreakdown.map((hour) => (
                                    <div key={hour.hour} className="flex justify-between items-center">
                                        <span className="font-medium">{hour.hour}</span>
                                        <div className="text-right">
                                            <div className="font-medium">{hour.orders} orders</div>
                                            <div className="text-sm text-gray-600">
                                                ${hour.revenue.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Order Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>
                        All completed orders for {new Date(selectedDate).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {dailyOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No completed orders for this date</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Order ID</th>
                                        <th className="text-left py-2">Time</th>
                                        <th className="text-left py-2">Type</th>
                                        <th className="text-left py-2">Table</th>
                                        <th className="text-left py-2">Items</th>
                                        <th className="text-right py-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyOrders.map((order: any) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 font-mono text-sm">
                                                #{order.id.slice(-6)}
                                            </td>
                                            <td className="py-3">
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${order.orderType === 'DINE_IN'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {order.orderType.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                {order.tableNumber || 'N/A'}
                                            </td>
                                            <td className="py-3">
                                                <div className="text-sm">
                                                    {order.items.map((item: any, index: number) => (
                                                        <div key={item.id}>
                                                            {item.quantity}× {item.product.name}
                                                            {index < order.items.length - 1 && ', '}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 text-right font-medium">
                                                ${order.total.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 font-semibold">
                                        <td colSpan={5} className="py-3 text-right">
                                            Total Revenue:
                                        </td>
                                        <td className="py-3 text-right text-lg text-green-600">
                                            ${statistics.totalRevenue.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}