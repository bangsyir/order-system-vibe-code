import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // Customer ordering routes
  route("order", "routes/order.tsx"),
  route("order/confirm", "routes/order.confirm.tsx"),

  // Dashboard routes
  route("dashboard", "routes/dashboard.tsx"),

  // Admin routes
  route("admin", "routes/admin.tsx", [
    route("products", "routes/admin.products.tsx"),
    route("products/new", "routes/admin.products.new.tsx"),
    route("products/:id/edit", "routes/admin.products.$id.edit.tsx"),
    route("customers", "routes/admin.customers.tsx"),
    route("sales", "routes/admin.sales.tsx"),
  ]),
] satisfies RouteConfig;
