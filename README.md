# Restaurant Ordering System

A modern web-based restaurant ordering system built with React Router v7, Tailwind CSS, shadcn/ui, Prisma, and SQLite.

## Features

### 🍽️ Customer Ordering Website

- Select table number or choose takeaway
- Browse menu items by category
- Add items to cart with quantity controls
- Real-time cart updates and total calculation
- Order confirmation with order tracking

### 📊 Real-Time Order Management Dashboard

- View all incoming orders in real-time
- Update order status (Pending → In Progress → Ready → Completed)
- Kitchen-friendly interface with order details
- Time tracking for each order

### 🛠️ Admin Panel

- **Product Management**: Full CRUD for menu items
  - Add/edit/delete products
  - Manage categories, pricing, and availability
  - Toggle product visibility
- **Customer Management**: View customer information and order history

## Tech Stack

- **Framework**: React Router v7 (Framework Mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: Prisma + SQLite
- **Validation**: Zod schemas for client/server validation
- **Icons**: Lucide React

## Project Structure

```
app/
├── components/ui/          # shadcn/ui components
├── lib/
│   ├── db.server.ts       # Prisma client setup
│   ├── schemas.ts         # Zod validation schemas
│   └── utils.ts           # Utility functions
├── routes/
│   ├── home.tsx           # Landing page
│   ├── order.tsx          # Customer ordering interface
│   ├── order.confirm.tsx  # Order confirmation
│   ├── dashboard.tsx      # Kitchen dashboard
│   ├── admin.tsx          # Admin panel layout
│   ├── admin.products.tsx # Product management
│   ├── admin.products.new.tsx
│   ├── admin.products.$id.edit.tsx
│   └── admin.customers.tsx
├── app.css               # Global styles
├── root.tsx              # App root component
└── routes.ts             # Route configuration

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Sample data seeding
```

## Database Schema

### Models

- **Category**: Product categories (Appetizers, Main Courses, etc.)
- **Product**: Menu items with pricing and availability
- **Customer**: Customer information (optional)
- **Order**: Orders with status tracking
- **OrderItem**: Individual items within orders

### Order Statuses

- `PENDING` - Order received, waiting to start
- `IN_PROGRESS` - Currently being prepared
- `READY` - Ready for pickup/serving
- `COMPLETED` - Order fulfilled
- `CANCELLED` - Order cancelled

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Create database and tables
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

3. **Run Tests**

   ```bash
   # Run all tests
   npm test

   # Run tests with UI
   npm run test:ui

   # Run tests once
   npm run test:run
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Visit the Application**
   - Main site: http://localhost:5173
   - Order food: http://localhost:5173/order
   - Kitchen dashboard: http://localhost:5173/dashboard
   - Admin panel: http://localhost:5173/admin

## Usage

### For Customers

1. Visit the ordering page
2. Select dine-in (with table number) or takeaway
3. Browse menu categories and add items to cart
4. Review order and submit
5. Receive order confirmation with tracking ID

### For Kitchen Staff

1. Access the dashboard to view incoming orders
2. Update order status as you prepare items
3. Mark orders as ready when complete

### For Administrators

1. Access admin panel to manage products
2. Add new menu items and categories
3. Update pricing and availability
4. View customer information and order history

## Testing

The application includes a comprehensive test suite covering:

### Test Categories

- **Schema Validation Tests**: Zod schema validation for all data types
- **Component Tests**: React component rendering and user interactions
- **Database Tests**: Prisma operations and data integrity
- **Business Logic Tests**: Sales calculations and analytics
- **Integration Tests**: End-to-end functionality testing

### Test Coverage

- ✅ Order creation and validation
- ✅ Product management operations
- ✅ Cart functionality and calculations
- ✅ Sales analytics and reporting
- ✅ Database operations (CRUD)
- ✅ User interface interactions
- ✅ Form validation and error handling

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests with interactive UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

## Key Features

### React Router v7 Framework Mode

- Server-side rendering (SSR) enabled
- Loaders for data fetching
- Actions for form submissions and mutations
- Type-safe route parameters and data

### Validation with Zod

- Client and server-side validation
- Type-safe schemas for all data operations
- Consistent error handling

### Modern UI with shadcn/ui

- Accessible components built on Radix UI
- Consistent design system
- Responsive layouts
- Dark mode support (configured in CSS)

### Database with Prisma

- Type-safe database operations
- Automatic migrations
- Relationship management
- SQLite for easy development

## Customization

### Adding New Menu Categories

1. Use the admin panel or directly add to the database
2. Products will automatically group by category

### Styling Customization

- Modify `app/app.css` for global styles
- Update Tailwind classes in components
- Customize shadcn/ui component variants

### Adding New Features

- Create new routes in `app/routes/`
- Add route configuration in `app/routes.ts`
- Extend database schema in `prisma/schema.prisma`
- Add validation schemas in `app/lib/schemas.ts`

## Production Deployment

1. **Build the Application**

   ```bash
   npm run build
   ```

2. **Setup Production Database**

   - Update `DATABASE_URL` in environment
   - Run migrations: `npm run db:push`

3. **Start Production Server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for your restaurant or modify it for your needs.
