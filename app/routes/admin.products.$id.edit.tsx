import { redirect } from "react-router";
import { Form, Link } from "react-router";
import { prisma } from "~/lib/db.server";
import { UpdateProductSchema } from "~/lib/schemas";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/admin.products.$id.edit";

export async function loader({ params }: Route.LoaderArgs) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true }
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return { product, categories };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();

  try {
    const productData = UpdateProductSchema.parse({
      name: formData.get("name") || undefined,
      description: formData.get("description") || undefined,
      price: formData.get("price") ? parseFloat(formData.get("price") as string) : undefined,
      image: formData.get("image") || undefined,
      available: formData.get("available") === "on",
      categoryId: formData.get("categoryId") || undefined,
    });

    await prisma.product.update({
      where: { id: params.id },
      data: productData,
    });

    return redirect("/admin/products");
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }
}

export default function EditProduct({ loaderData }: Route.ComponentProps) {
  const { product, categories } = loaderData;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
        <p className="text-gray-600">Update product information</p>
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
                defaultValue={product.name}
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
                defaultValue={product.description || ''}
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
                  defaultValue={product.price}
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
                  defaultValue={product.categoryId}
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
                defaultValue={product.image || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="available"
                id="available"
                defaultChecked={product.available}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                Available for ordering
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Update Product
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