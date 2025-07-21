import { describe, it, expect, vi } from "vitest";

describe("Sales Analytics", () => {
  describe("Daily Sales Calculations", () => {
    const mockOrders = [
      {
        id: "order1",
        total: 25.99,
        orderType: "DINE_IN",
        createdAt: new Date("2024-01-01T12:00:00.000Z"),
        items: [
          {
            id: "item1",
            quantity: 1,
            price: 25.99,
            product: { name: "Steak" },
          },
        ],
      },
      {
        id: "order2",
        total: 18.99,
        orderType: "TAKEAWAY",
        createdAt: new Date("2024-01-01T18:00:00.000Z"),
        items: [
          {
            id: "item2",
            quantity: 2,
            price: 9.5,
            product: { name: "Burger" },
          },
        ],
      },
      {
        id: "order3",
        total: 12.99,
        orderType: "DINE_IN",
        createdAt: new Date("2024-01-01T20:00:00.000Z"),
        items: [
          {
            id: "item3",
            quantity: 1,
            price: 12.99,
            product: { name: "Salad" },
          },
        ],
      },
    ];

    it("should calculate total revenue correctly", () => {
      const totalRevenue = mockOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      expect(totalRevenue).toBe(57.97);
    });

    it("should calculate total orders correctly", () => {
      const totalOrders = mockOrders.length;
      expect(totalOrders).toBe(3);
    });

    it("should calculate average order value correctly", () => {
      const totalRevenue = mockOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const totalOrders = mockOrders.length;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      expect(averageOrderValue).toBeCloseTo(19.32, 2);
    });

    it("should calculate order type breakdown correctly", () => {
      const dineInOrders = mockOrders.filter(
        (order) => order.orderType === "DINE_IN"
      ).length;
      const takeawayOrders = mockOrders.filter(
        (order) => order.orderType === "TAKEAWAY"
      ).length;

      expect(dineInOrders).toBe(2);
      expect(takeawayOrders).toBe(1);
    });

    it("should calculate top selling products correctly", () => {
      const productSales = new Map();

      mockOrders.forEach((order) => {
        order.items.forEach((item) => {
          const key = item.product.name;
          if (productSales.has(key)) {
            const existing = productSales.get(key);
            productSales.set(key, {
              ...existing,
              quantity: existing.quantity + item.quantity,
              revenue: existing.revenue + item.price * item.quantity,
            });
          } else {
            productSales.set(key, {
              name: item.product.name,
              quantity: item.quantity,
              revenue: item.price * item.quantity,
            });
          }
        });
      });

      const topProducts = Array.from(productSales.values()).sort(
        (a, b) => b.quantity - a.quantity
      );

      expect(topProducts).toHaveLength(3);
      expect(topProducts[0].name).toBe("Burger"); // 2 quantity
      expect(topProducts[0].quantity).toBe(2);
      expect(topProducts[0].revenue).toBe(19.0);

      expect(topProducts[1].name).toBe("Steak"); // 1 quantity
      expect(topProducts[1].quantity).toBe(1);
      expect(topProducts[1].revenue).toBe(25.99);
    });

    it("should calculate hourly breakdown correctly", () => {
      const selectedDate = "2024-01-01";

      const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
        const hourStart = new Date(selectedDate);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(selectedDate);
        hourEnd.setHours(hour, 59, 59, 999);

        const hourOrders = mockOrders.filter((order) => {
          const orderTime = new Date(order.createdAt);
          return orderTime >= hourStart && orderTime <= hourEnd;
        });

        return {
          hour: `${hour.toString().padStart(2, "0")}:00`,
          orders: hourOrders.length,
          revenue: hourOrders.reduce((sum, order) => sum + order.total, 0),
        };
      }).filter((hour) => hour.orders > 0);

      expect(hourlyBreakdown).toHaveLength(3); // 12:00, 18:00, 20:00

      const noon = hourlyBreakdown.find((h) => h.hour === "12:00");
      expect(noon?.orders).toBe(1);
      expect(noon?.revenue).toBe(25.99);

      const evening = hourlyBreakdown.find((h) => h.hour === "18:00");
      expect(evening?.orders).toBe(1);
      expect(evening?.revenue).toBe(18.99);

      const night = hourlyBreakdown.find((h) => h.hour === "20:00");
      expect(night?.orders).toBe(1);
      expect(night?.revenue).toBe(12.99);
    });
  });

  describe("Date Range Calculations", () => {
    it("should create correct date range for selected day", () => {
      const selectedDate = "2024-01-15";

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      expect(startOfDay.toISOString()).toBe("2024-01-15T00:00:00.000Z");
      expect(endOfDay.toISOString()).toBe("2024-01-15T23:59:59.999Z");
    });

    it("should handle current date when no date provided", () => {
      const today = new Date().toISOString().split("T")[0];
      const selectedDate = undefined || today;

      expect(selectedDate).toBe(today);
    });
  });

  describe("PDF Report Data Preparation", () => {
    const mockStatistics = {
      totalRevenue: 157.45,
      totalOrders: 8,
      averageOrderValue: 19.68,
      dineInOrders: 5,
      takeawayOrders: 3,
    };

    const mockTopProducts = [
      { name: "Pizza", quantity: 5, revenue: 94.95 },
      { name: "Burger", quantity: 3, revenue: 35.97 },
      { name: "Salad", quantity: 2, revenue: 25.98 },
    ];

    it("should format summary data for PDF", () => {
      const summaryData = [
        ["Total Revenue", `$${mockStatistics.totalRevenue.toFixed(2)}`],
        ["Total Orders", mockStatistics.totalOrders.toString()],
        [
          "Average Order Value",
          `$${mockStatistics.averageOrderValue.toFixed(2)}`,
        ],
        ["Dine-In Orders", mockStatistics.dineInOrders.toString()],
        ["Takeaway Orders", mockStatistics.takeawayOrders.toString()],
      ];

      expect(summaryData).toEqual([
        ["Total Revenue", "$157.45"],
        ["Total Orders", "8"],
        ["Average Order Value", "$19.68"],
        ["Dine-In Orders", "5"],
        ["Takeaway Orders", "3"],
      ]);
    });

    it("should format product data for PDF", () => {
      const productData = mockTopProducts.map((product) => [
        product.name,
        product.quantity.toString(),
        `$${product.revenue.toFixed(2)}`,
      ]);

      expect(productData).toEqual([
        ["Pizza", "5", "$94.95"],
        ["Burger", "3", "$35.97"],
        ["Salad", "2", "$25.98"],
      ]);
    });

    it("should format order data for PDF", () => {
      const mockOrders = [
        {
          id: "order123456",
          createdAt: new Date("2024-01-01T12:30:00.000Z"),
          orderType: "DINE_IN",
          tableNumber: "5",
          total: 25.99,
        },
        {
          id: "order789012",
          createdAt: new Date("2024-01-01T18:45:00.000Z"),
          orderType: "TAKEAWAY",
          tableNumber: null,
          total: 18.99,
        },
      ];

      const orderData = mockOrders.map((order) => [
        `#${order.id.slice(-6)}`,
        new Date(order.createdAt).toLocaleTimeString(),
        order.orderType.replace("_", " "),
        order.tableNumber || "N/A",
        `$${order.total.toFixed(2)}`,
      ]);

      expect(orderData).toEqual([
        ["#123456", "12:30:00 PM", "DINE IN", "5", "$25.99"],
        ["#789012", "6:45:00 PM", "TAKEAWAY", "N/A", "$18.99"],
      ]);
    });
  });
});
