import { useSubmit } from "react-router";
import { prisma } from "~/lib/db.server";
import { UpdateOrderStatusSchema } from "~/lib/schemas";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Clock, ChefHat, CheckCircle, X } from "lucide-react";
import type { Route } from "./+types/dashboard";

export async function loader() {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        not: "COMPLETED"
      }
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return { orders };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;

  try {
    const validatedData = UpdateOrderStatusSchema.parse({ status });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: validatedData.status },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Response("Failed to update order status", { status: 400 });
  }
}

const statusConfig = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    nextStatus: "IN_PROGRESS",
    nextLabel: "Start Cooking",
  },
  IN_PROGRESS: {
    color: "bg-blue-100 text-blue-800",
    icon: ChefHat,
    nextStatus: "READY",
    nextLabel: "Mark Ready",
  },
  READY: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    nextStatus: "COMPLETED",
    nextLabel: "Complete Order",
  },
};

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;
  const submit = useSubmit();

  const updateOrderStatus = (orderId: string, status: string) => {
    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("status", status);
    submit(formData, { method: "post" });
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const orderTime = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ${diffInMinutes % 60}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kitchen Dashboard</h1>
            <p className="text-gray-600">Manage incoming orders</p>
          </div>
          <div className="text-sm text-gray-500">
            {orders.length} active orders
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active orders at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order: any) => {
              const config = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = config?.icon || Clock;

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(-6)}
                        </CardTitle>
                        <CardDescription>
                          {order.orderType === "DINE_IN"
                            ? `Table ${order.tableNumber}`
                            : "Takeaway"
                          }
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {order.status.replace('_', ' ')}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getTimeAgo(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}× {item.product.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mb-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {config && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, config.nextStatus)}
                          className="flex-1"
                          size="sm"
                        >
                          {config.nextLabel}
                        </Button>
                      )}
                      <Button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}