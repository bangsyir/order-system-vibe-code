import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
process.env.NODE_ENV = "test";

// Mock Prisma client for tests
vi.mock("~/lib/db.server", () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    customer: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock React Router
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useSubmit: vi.fn(),
    Form: ({ children, ...props }: any) => {
      const element = document.createElement("form");
      Object.assign(element, props);
      if (typeof children === "string") {
        element.innerHTML = children;
      }
      return element;
    },
    Link: ({ children, to, ...props }: any) => {
      const element = document.createElement("a");
      element.href = to;
      Object.assign(element, props);
      if (typeof children === "string") {
        element.innerHTML = children;
      }
      return element;
    },
  };
});
