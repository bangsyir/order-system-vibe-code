import "@testing-library/jest-dom";

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
    Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});
