import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Start updating categories...")

  // UPSERT: Kids
  await prisma.category.upsert({
    where: { slug: 'kids' },
    update: { name: 'Kids' },
    create: {
      name: 'Kids',
      slug: 'kids',
    },
  })
  console.log("Upserted 'Kids' category.")

  // UPSERT: Shoes
  await prisma.category.upsert({
    where: { slug: 'shoes' },
    update: { name: 'Shoes' },
    create: {
      name: 'Shoes',
      slug: 'shoes',
    },
  })
  console.log("Upserted 'Shoes' category.")

  // UPSERT: Men (Ensure it exists)
  await prisma.category.upsert({
    where: { slug: 'men' },
    update: { name: 'Men' },
    create: {
      name: 'Men',
      slug: 'men',
    },
  })
    console.log("Upserted 'Men' category.")


  // DELETE: Women (if empty)
  try {
      const women = await prisma.category.findUnique({ where: { slug: 'women' } });
      if (women) {
          // Check for products
          const count = await prisma.product.count({ where: { categoryId: women.id } });
          if (count === 0) {
              await prisma.category.delete({ where: { slug: 'women' } });
              console.log("Deleted 'Women' category (empty).");
          } else {
              console.log(`Skipped deleting 'Women' category (has ${count} products). Please migrate products manually.`);
          }
      }
  } catch (e) {
      console.error("Error checking/deleting 'Women':", e);
  }

  // DELETE: Accessories (if empty)
  try {
      const accessories = await prisma.category.findUnique({ where: { slug: 'accessories' } });
      if (accessories) {
          // Check for products
          const count = await prisma.product.count({ where: { categoryId: accessories.id } });
          if (count === 0) {
              await prisma.category.delete({ where: { slug: 'accessories' } });
              console.log("Deleted 'Accessories' category (empty).");
          } else {
              console.log(`Skipped deleting 'Accessories' category (has ${count} products). Please migrate products manually.`);
          }
      }
  } catch (e) {
      console.error("Error checking/deleting 'Accessories':", e);
  }

  console.log("Category update finished.")
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
