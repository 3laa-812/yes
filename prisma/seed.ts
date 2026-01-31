import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Categories
  const men = await prisma.category.upsert({
    where: { slug: 'men' },
    update: {},
    create: {
      name: 'Men',
      slug: 'men',
    },
  })

  const women = await prisma.category.upsert({
    where: { slug: 'women' },
    update: {},
    create: {
      name: 'Women',
      slug: 'women',
    },
  })

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
    },
  })

  // Products
  await prisma.product.create({
    data: {
      name: 'Basic White Tee',
      description: 'The essential white t-shirt. Made from 100% organic cotton.',
      price: 29.99,
      images: JSON.stringify(['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800']),
      categoryId: men.id,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['#ffffff']),
      stock: 100,
    },
  })

  await prisma.product.create({
    data: {
      name: 'Denim Jacket',
      description: 'Classic denim jacket with a modern fit. Perfect for layering.',
      price: 89.99,
      images: JSON.stringify(['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=800']),
      categoryId: men.id,
      sizes: JSON.stringify(['S', 'M', 'L']),
      colors: JSON.stringify(['#0f172a']),
      stock: 50,
    },
  })

  await prisma.product.create({
    data: {
      name: 'Floral Summer Dress',
      description: 'Lightweight and breezy dress for warm summer days.',
      price: 59.99,
      images: JSON.stringify(['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800']),
      categoryId: women.id,
      sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
      colors: JSON.stringify(['#ffcec5']),
      stock: 75,
    },
  })

  await prisma.product.create({
    data: {
      name: 'Leather Tote Bag',
      description: 'Premium leather tote bag. Spacious and durable.',
      price: 129.99,
      images: JSON.stringify(['https://images.unsplash.com/photo-1590874102752-ce34184f0947?auto=format&fit=crop&q=80&w=800']),
      categoryId: accessories.id,
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['#3f2e1e']),
      stock: 30,
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
