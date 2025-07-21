import { redirect } from "react-router";
import { Form, Link } from "react-router";
import { prisma } from "~/lib/db.server";
import { CreateProductSchema } from "~/lib/schemas";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/admin.products.new";

export async function loader() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return { categories };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  try {
    const productData = CreateProductSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      price: parseFloat(formData.get("price") as string),
      image: formData.get("image") || undefined,
      available: formData.get("available") === "on",
      categoryId: formData.get("categoryId"),
    });

    await prisma.product.create({
      data: productData,
    });

    return redirect("/admin/products");
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
}

export default function NewProduct({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
        <p className="text-gray-600">Create a new menu item</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="available"
                id="available"
                defaultChecked
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                Available for ordering
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Create Product
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link to="/admin/products">Cancel</Link>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}