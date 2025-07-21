import { redirect } from "react-router";
import { Link, useLoaderData } from "react-router";
import { prisma } from "~/lib/db.server";
import { CreateOrderSchema } from "~/lib/schemas";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckCircle } from "lucide-react";
import type { Route } from "./+types/order.confirm";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const orderType = formData.get("orderType") as string;
  const tableNumber = formData.get("tableNumber") as string;
  const cartData = formData.get("cart") as string;
  const total = parseFloat(formData.get("total") as string);

  try {
    const cart = JSON.parse(cartData);

    // Validate the order data
    const orderData = CreateOrderSchema.parse({
      orderType: orderType as "DINE_IN" | "TAKEAWAY",
      tableNumber: orderType === "DINE_IN" ? tableNumber : undefined,
      items: cart.map((item: any) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderType: orderData.orderType,
        tableNumber: orderData.tableNumber,
        total,
        status: "PENDING",
        items: {
          create: orderData.items,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return redirect(`/order/confirm?orderId=${order.id}`);
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Response("Failed to create order", { status: 400 });
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!orderId) {
    throw redirect("/order");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Response("Order not found", { status: 404 });
  }

  return { order };
}

export default function OrderConfirm({ loaderData }: Route.ComponentProps) {
  const { order } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Order Confirmed!
              </CardTitle>
              <CardDescription>
                Your order has been successfully placed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Order ID:</span>
                  <span className="font-mono text-sm">{order.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Order Type:</span>
                  <span className="capitalize">
                    {order.orderType.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                {order.tableNumber && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Table Number:</span>
                    <span>{order.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {order.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-xl text-orange-600">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Your order is being prepared. You can track its status on the dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/order">Place Another Order</Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}