import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const appetizers = await prisma.category.create({
    data: {
      name: 'Appetizers',
      description: 'Start your meal with our delicious appetizers',
    },
  })

  const mains = await prisma.category.create({
    data: {
      name: 'Main Courses',
      description: 'Hearty main dishes to satisfy your hunger',
    },
  })

  const desserts = await prisma.category.create({
    data: {
      name: 'Desserts',
      description: 'Sweet treats to end your meal',
    },
  })

  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Refreshing drinks and hot beverages',
    },
  })

  // Create sample products
  await prisma.product.createMany({
    data: [
      // Appetizers
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan cheese and croutons',
        price: 12.99,
        categoryId: appetizers.id,
        available: true,
      },
      {
        name: 'Buffalo Wings',
        description: 'Spicy chicken wings served with blue cheese dip',
        price: 14.99,
        categoryId: appetizers.id,
        available: true,
      },
      // Main Courses
      {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with lemon herb seasoning',
        price: 24.99,
        categoryId: mains.id,
        available: true,
      },
      {
        name: 'Ribeye Steak',
        description: '12oz prime ribeye steak cooked to perfection',
        price: 32.99,
        categoryId: mains.id,
        available: true,
      },
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella and basil',
        price: 18.99,
        categoryId: mains.id,
        available: true,
      },
      // Desserts
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 8.99,
        categoryId: desserts.id,
        available: true,
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        price: 9.99,
        categoryId: desserts.id,
        available: true,
      },
      // Beverages
      {
        name: 'Coca Cola',
        description: 'Classic soft drink',
        price: 3.99,
        categoryId: beverages.id,
        available: true,
      },
      {
        name: 'Coffee',
        description: 'Freshly brewed coffee',
        price: 4.99,
        categoryId: beverages.id,
        available: true,
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })