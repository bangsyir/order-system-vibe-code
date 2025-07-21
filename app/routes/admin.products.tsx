import { Link, useSubmit } from "react-router";
import { prisma } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from "lucide-react";
import type { Route } from "./+types/admin.products";

export async function loader() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return { categories };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action") as string;
  const productId = formData.get("productId") as string;

  try {
    switch (action) {
      case "toggleAvailability":
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (product) {
          await prisma.product.update({
            where: { id: productId },
            data: { available: !product.available }
          });
        }
        break;

      case "deleteProduct":
        await prisma.product.delete({
          where: { id: productId }
        });
        break;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in product action:", error);
    throw new Response("Failed to perform action", { status: 400 });
  }
}

export default function AdminProducts({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;
  const submit = useSubmit();

  const toggleAvailability = (productId: string) => {
    const formData = new FormData();
    formData.append("_action", "toggleAvailability");
    formData.append("productId", productId);
    submit(formData, { method: "post" });
  };

  const deleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const formData = new FormData();
      formData.append("_action", "deleteProduct");
      formData.append("productId", productId);
      submit(formData, { method: "post" });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your menu items and categories</p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No products found</p>
            <Button asChild>
              <Link to="/admin/products/new">Add Your First Product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {categories.map((category: any) => (
            <div key={category.id}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {category.products.length} products
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.products.map((product: any) => (
                  <Card key={product.id} className={`hover:shadow-md transition-shadow ${!product.available ? 'opacity-60' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.description && (
                            <CardDescription className="mt-1">
                              {product.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {product.available ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-orange-600">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {product.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAvailability(product.id)}
                          className="flex-1"
                        >
                          {product.available ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Show
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}