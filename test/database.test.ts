import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "~/lib/db.server";

describe("Database Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Category Operations", () => {
    it("should fetch categories with products", async () => {
      const mockCategories = [
        {
          id: "cat1",
          name: "Main Courses",
          products: [
            { id: "prod1", name: "Pizza", price: 18.99, available: true },
          ],
        },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(
        mockCategories as any
      );

      const result = await prisma.category.findMany({
        include: {
          products: {
            where: { available: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      expect(result).toEqual(mockCategories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: {
          products: {
            where: { available: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });
    });

    it("should create a new category", async () => {
      const newCategory = {
        id: "cat2",
        name: "Desserts",
        description: "Sweet treats",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.category.create).mockResolvedValue(newCategory as any);

      const result = await prisma.category.create({
        data: {
          name: "Desserts",
          description: "Sweet treats",
        },
      });

      expect(result).toEqual(newCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "Desserts",
          description: "Sweet treats",
        },
      });
    });
  });

  describe("Product Operations", () => {
    it("should create a new product", async () => {
      const newProduct = {
        id: "prod1",
        name: "Margherita Pizza",
        description: "Classic pizza",
        price: 18.99,
        available: true,
        categoryId: "cat1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.product.create).mockResolvedValue(newProduct as any);

      const result = await prisma.product.create({
        data: {
          name: "Margherita Pizza",
          description: "Classic pizza",
          price: 18.99,
          available: true,
          categoryId: "cat1",
        },
      });

      expect(result).toEqual(newProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: "Margherita Pizza",
          description: "Classic pizza",
          price: 18.99,
          available: true,
          categoryId: "cat1",
        },
      });
    });

    it("should update product availability", async () => {
      const updatedProduct = {
        id: "prod1",
        name: "Pizza",
        available: false,
      };

      vi.mocked(prisma.product.update).mockResolvedValue(updatedProduct as any);

      const result = await prisma.product.update({
        where: { id: "prod1" },
        data: { available: false },
      });

      expect(result).toEqual(updatedProduct);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod1" },
        data: { available: false },
      });
    });

    it("should delete a product", async () => {
      const deletedProduct = { id: "prod1", name: "Pizza" };

      vi.mocked(prisma.product.delete).mockResolvedValue(deletedProduct as any);

      const result = await prisma.product.delete({
        where: { id: "prod1" },
      });

      expect(result).toEqual(deletedProduct);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: "prod1" },
      });
    });
  });

  describe("Order Operations", () => {
    it("should create a new order with items", async () => {
      const newOrder = {
        id: "order1",
        orderType: "DINE_IN",
        tableNumber: "5",
        status: "PENDING",
        total: 43.98,
        items: [
          {
            id: "item1",
            productId: "prod1",
            quantity: 2,
            price: 18.99,
          },
        ],
      };

      vi.mocked(prisma.order.create).mockResolvedValue(newOrder as any);

      const result = await prisma.order.create({
        data: {
          orderType: "DINE_IN",
          tableNumber: "5",
          status: "PENDING",
          total: 43.98,
          items: {
            create: [
              {
                productId: "prod1",
                quantity: 2,
                price: 18.99,
              },
            ],
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      expect(result).toEqual(newOrder);
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          orderType: "DINE_IN",
          tableNumber: "5",
          status: "PENDING",
          total: 43.98,
          items: {
            create: [
              {
                productId: "prod1",
                quantity: 2,
                price: 18.99,
              },
            ],
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it("should update order status", async () => {
      const updatedOrder = {
        id: "order1",
        status: "IN_PROGRESS",
      };

      vi.mocked(prisma.order.update).mockResolvedValue(updatedOrder as any);

      const result = await prisma.order.update({
        where: { id: "order1" },
        data: { status: "IN_PROGRESS" },
      });

      expect(result).toEqual(updatedOrder);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: "order1" },
        data: { status: "IN_PROGRESS" },
      });
    });

    it("should fetch orders for dashboard", async () => {
      const mockOrders = [
        {
          id: "order1",
          status: "PENDING",
          orderType: "DINE_IN",
          tableNumber: "5",
          total: 25.99,
          items: [
            {
              id: "item1",
              quantity: 1,
              price: 25.99,
              product: { name: "Steak" },
            },
          ],
        },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await prisma.order.findMany({
        where: {
          status: {
            not: "COMPLETED",
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      expect(result).toEqual(mockOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            not: "COMPLETED",
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    });
  });

  describe("Sales Analytics", () => {
    it("should fetch completed orders for date range", async () => {
      const startOfDay = new Date("2024-01-01T00:00:00.000Z");
      const endOfDay = new Date("2024-01-01T23:59:59.999Z");

      const mockOrders = [
        {
          id: "order1",
          status: "COMPLETED",
          total: 25.99,
          orderType: "DINE_IN",
          createdAt: new Date("2024-01-01T12:00:00.000Z"),
        },
        {
          id: "order2",
          status: "COMPLETED",
          total: 18.99,
          orderType: "TAKEAWAY",
          createdAt: new Date("2024-01-01T18:00:00.000Z"),
        },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await prisma.order.findMany({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      expect(result).toEqual(mockOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should count total orders", async () => {
      vi.mocked(prisma.order.count).mockResolvedValue(150);

      const result = await prisma.order.count();

      expect(result).toBe(150);
      expect(prisma.order.count).toHaveBeenCalled();
    });
  });
});
