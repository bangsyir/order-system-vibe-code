import { useState } from "react";
import { Form, Link, useLoaderData, useSubmit } from "react-router";
import { prisma } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import type { Route } from "./+types/order";

export async function loader() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: { available: true },
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return { categories };
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function Order({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('');

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
            <p className="text-gray-600">Choose your delicious meal</p>
          </div>
          <Link to="/" className="text-orange-600 hover:text-orange-700">
            ← Back to Home
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Order Type Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={orderType === 'DINE_IN' ? 'default' : 'outline'}
                    onClick={() => setOrderType('DINE_IN')}
                  >
                    Dine In
                  </Button>
                  <Button
                    variant={orderType === 'TAKEAWAY' ? 'default' : 'outline'}
                    onClick={() => setOrderType('TAKEAWAY')}
                  >
                    Takeaway
                  </Button>
                </div>
                {orderType === 'DINE_IN' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Table Number
                    </label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter table number"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Categories */}
            {categories.map((category: any) => (
              <div key={category.id} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {category.name}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {category.products.map((product: any) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            {product.description && (
                              <p className="text-gray-600 text-sm mb-2">
                                {product.description}
                              </p>
                            )}
                            <p className="text-orange-600 font-bold text-lg">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {cart.find(item => item.id === product.id) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(product.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-medium">
                                  {cart.find(item => item.id === product.id)?.quantity || 0}
                                </span>
                              </>
                            )}
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Order ({getTotalItems()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-lg">Total:</span>
                        <span className="font-bold text-xl text-orange-600">
                          ${getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                      <Form method="post" action="/order/confirm">
                        <input type="hidden" name="orderType" value={orderType} />
                        <input type="hidden" name="tableNumber" value={tableNumber} />
                        <input type="hidden" name="cart" value={JSON.stringify(cart)} />
                        <input type="hidden" name="total" value={getTotalPrice().toFixed(2)} />
                        <Button
                          type="submit"
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          disabled={cart.length === 0 || (orderType === 'DINE_IN' && !tableNumber)}
                        >
                          Place Order
                        </Button>
                      </Form>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}