import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Bistro Express
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Order delicious food with ease
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-orange-600">Order Food</CardTitle>
              <CardDescription>
                Browse our menu and place your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link to="/order">Start Ordering</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-600">Kitchen Dashboard</CardTitle>
              <CardDescription>
                View and manage incoming orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-600">Admin Panel</CardTitle>
              <CardDescription>
                Manage products and customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin">Admin Panel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}