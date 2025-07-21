import { z } from 'zod'

// Order schemas
export const OrderTypeSchema = z.enum(['DINE_IN', 'TAKEAWAY'])
export const OrderStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'])

export const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
})

export const CreateOrderSchema = z.object({
  tableNumber: z.string().optional(),
  orderType: OrderTypeSchema,
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  customerId: z.string().optional(),
})

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
})

// Product schemas
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  image: z.string().optional(),
  available: z.boolean().default(true),
  categoryId: z.string().min(1, 'Category is required'),
})

export const UpdateProductSchema = CreateProductSchema.partial()

// Category schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

// Customer schemas
export const CreateCustomerSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
})

export const UpdateCustomerSchema = CreateCustomerSchema.partial()

// Cart item schema for client-side
export const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  image: z.string().optional(),
})