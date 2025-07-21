import { prisma } from "~/lib/db.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, ShoppingBag } from "lucide-react";
import type { Route } from "./+types/admin.customers";

export async function loader() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalCustomers = await prisma.customer.count();
  const totalOrders = await prisma.order.count();

  return { customers, totalCustomers, totalOrders };
}

export default function AdminCustomers({ loaderData }: Route.ComponentProps) {
  const { customers, totalCustomers, totalOrders } = loaderData;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <p className="text-gray-600">View and manage customer information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No customers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer: any) => (
            <Card key={customer.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {customer.name || 'Anonymous Customer'}
                    </CardTitle>
                    <CardDescription>
                      {customer.email && (
                        <span className="block">{customer.email}</span>
                      )}
                      {customer.phone && (
                        <span className="block">{customer.phone}</span>
                      )}
                      <span className="block text-xs">
                        Customer since {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {customer._count.orders} orders
                    </div>
                  </div>
                </div>
              </CardHeader>
              {customer.orders.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Recent Orders:</h4>
                    {customer.orders.map((order: any) => (
                      <div key={order.id} className="flex justify-between items-center text-sm">
                        <span>
                          Order #{order.id.slice(-6)} - {order.orderType.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                            }`}>
                            {order.status}
                          </span>
                          <span className="font-medium">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}