import { Link, Outlet } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Package, Users, BarChart3, DollarSign } from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your restaurant operations</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/admin/products" className="block hover:scale-105 transition-transform">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-blue-600">Product Management</CardTitle>
                    <CardDescription>
                      Manage menu items, categories, and pricing
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/customers" className="block hover:scale-105 transition-transform">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-green-600">Customer Management</CardTitle>
                    <CardDescription>
                      View and manage customer information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/sales" className="block hover:scale-105 transition-transform">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                  <div>
                    <CardTitle className="text-orange-600">Sales Report</CardTitle>
                    <CardDescription>
                      Daily sales summary and PDF export
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/dashboard" className="block hover:scale-105 transition-transform">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <CardTitle className="text-purple-600">Kitchen Dashboard</CardTitle>
                    <CardDescription>
                      Monitor orders and kitchen operations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}