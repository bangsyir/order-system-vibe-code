import { describe, it, expect } from "vitest";
import {
  OrderTypeSchema,
  OrderStatusSchema,
  CreateOrderSchema,
  CreateProductSchema,
  CreateCategorySchema,
  CartItemSchema,
} from "~/lib/schemas";

describe("Zod Schemas", () => {
  describe("OrderTypeSchema", () => {
    it("should accept valid order types", () => {
      expect(OrderTypeSchema.parse("DINE_IN")).toBe("DINE_IN");
      expect(OrderTypeSchema.parse("TAKEAWAY")).toBe("TAKEAWAY");
    });

    it("should reject invalid order types", () => {
      expect(() => OrderTypeSchema.parse("INVALID")).toThrow();
      expect(() => OrderTypeSchema.parse("")).toThrow();
    });
  });

  describe("OrderStatusSchema", () => {
    it("should accept valid order statuses", () => {
      expect(OrderStatusSchema.parse("PENDING")).toBe("PENDING");
      expect(OrderStatusSchema.parse("IN_PROGRESS")).toBe("IN_PROGRESS");
      expect(OrderStatusSchema.parse("READY")).toBe("READY");
      expect(OrderStatusSchema.parse("COMPLETED")).toBe("COMPLETED");
      expect(OrderStatusSchema.parse("CANCELLED")).toBe("CANCELLED");
    });

    it("should reject invalid order statuses", () => {
      expect(() => OrderStatusSchema.parse("INVALID")).toThrow();
    });
  });

  describe("CreateOrderSchema", () => {
    it("should validate a complete order", () => {
      const validOrder = {
        orderType: "DINE_IN" as const,
        tableNumber: "5",
        items: [
          {
            productId: "prod1",
            quantity: 2,
            price: 12.99,
          },
        ],
      };

      const result = CreateOrderSchema.parse(validOrder);
      expect(result).toEqual(validOrder);
    });

    it("should validate takeaway order without table number", () => {
      const validOrder = {
        orderType: "TAKEAWAY" as const,
        items: [
          {
            productId: "prod1",
            quantity: 1,
            price: 8.99,
          },
        ],
      };

      const result = CreateOrderSchema.parse(validOrder);
      expect(result).toEqual(validOrder);
    });

    it("should reject order without items", () => {
      const invalidOrder = {
        orderType: "DINE_IN" as const,
        items: [],
      };

      expect(() => CreateOrderSchema.parse(invalidOrder)).toThrow();
    });

    it("should reject items with invalid quantity", () => {
      const invalidOrder = {
        orderType: "DINE_IN" as const,
        items: [
          {
            productId: "prod1",
            quantity: 0,
            price: 12.99,
          },
        ],
      };

      expect(() => CreateOrderSchema.parse(invalidOrder)).toThrow();
    });
  });

  describe("CreateProductSchema", () => {
    it("should validate a complete product", () => {
      const validProduct = {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato and mozzarella",
        price: 18.99,
        image: "https://example.com/pizza.jpg",
        available: true,
        categoryId: "cat1",
      };

      const result = CreateProductSchema.parse(validProduct);
      expect(result).toEqual(validProduct);
    });

    it("should validate product with minimal fields", () => {
      const validProduct = {
        name: "Simple Dish",
        price: 10.0,
        categoryId: "cat1",
      };

      const result = CreateProductSchema.parse(validProduct);
      expect(result.name).toBe("Simple Dish");
      expect(result.price).toBe(10.0);
      expect(result.available).toBe(true); // default value
    });

    it("should reject product with negative price", () => {
      const invalidProduct = {
        name: "Invalid Product",
        price: -5.0,
        categoryId: "cat1",
      };

      expect(() => CreateProductSchema.parse(invalidProduct)).toThrow();
    });

    it("should reject product without name", () => {
      const invalidProduct = {
        name: "",
        price: 10.0,
        categoryId: "cat1",
      };

      expect(() => CreateProductSchema.parse(invalidProduct)).toThrow();
    });
  });

  describe("CreateCategorySchema", () => {
    it("should validate a complete category", () => {
      const validCategory = {
        name: "Main Courses",
        description: "Hearty main dishes",
      };

      const result = CreateCategorySchema.parse(validCategory);
      expect(result).toEqual(validCategory);
    });

    it("should validate category with name only", () => {
      const validCategory = {
        name: "Desserts",
      };

      const result = CreateCategorySchema.parse(validCategory);
      expect(result.name).toBe("Desserts");
    });

    it("should reject category without name", () => {
      const invalidCategory = {
        name: "",
      };

      expect(() => CreateCategorySchema.parse(invalidCategory)).toThrow();
    });
  });

  describe("CartItemSchema", () => {
    it("should validate a cart item", () => {
      const validCartItem = {
        id: "prod1",
        name: "Pizza",
        price: 18.99,
        quantity: 2,
        image: "https://example.com/pizza.jpg",
      };

      const result = CartItemSchema.parse(validCartItem);
      expect(result).toEqual(validCartItem);
    });

    it("should validate cart item without image", () => {
      const validCartItem = {
        id: "prod1",
        name: "Pizza",
        price: 18.99,
        quantity: 1,
      };

      const result = CartItemSchema.parse(validCartItem);
      expect(result.image).toBeUndefined();
    });

    it("should reject cart item with zero quantity", () => {
      const invalidCartItem = {
        id: "prod1",
        name: "Pizza",
        price: 18.99,
        quantity: 0,
      };

      expect(() => CartItemSchema.parse(invalidCartItem)).toThrow();
    });
  });
});
