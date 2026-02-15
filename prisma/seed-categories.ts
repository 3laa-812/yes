
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    name_en: 'Men',
    name_ar: 'الرجال',
    slug: 'men',
    displayOrder: 1,
    children: [
      { name_en: 'Hoodies', name_ar: 'هوديز', slug: 'men-hoodies', displayOrder: 1 },
      { name_en: 'T-Shirts', name_ar: 'تيشيرتات', slug: 'men-t-shirts', displayOrder: 2 },
      { name_en: 'Pants', name_ar: 'بناطيل', slug: 'men-pants', displayOrder: 3 },
      { name_en: 'Jackets', name_ar: 'جاكيتات', slug: 'men-jackets', displayOrder: 4 },
      { name_en: 'Sets', name_ar: 'أطقم', slug: 'men-sets', displayOrder: 5 },
    ],
  },
  {
    name_en: 'Kids',
    name_ar: 'الأطفال',
    slug: 'kids',
    displayOrder: 2,
    children: [
      { name_en: 'T-Shirts', name_ar: 'تيشيرتات', slug: 'kids-t-shirts', displayOrder: 1 },
      { name_en: 'Pants', name_ar: 'بناطيل', slug: 'kids-pants', displayOrder: 2 },
      { name_en: 'Sets', name_ar: 'أطقم', slug: 'kids-sets', displayOrder: 3 },
      { name_en: 'Shoes', name_ar: 'أحذية', slug: 'kids-shoes', displayOrder: 4 },
    ],
  },
  {
    name_en: 'Shoes',
    name_ar: 'أحذية',
    slug: 'shoes',
    displayOrder: 3,
    children: [
       // As per request "Shoes -> Shoes" is confusing but listed. I will use "All Shoes" or just "Shoes" again?
       // Maybe "Shoes" main category, subcategories: Sneakers, Casual, Sports.
       // The request says "Shoes" (Main) -> "Shoes" (Sub), "Sneakers", "Casual Shoes", "Sports Shoes"
       // I will follow the request strictly but maybe "General Shoes" as name_en for the sub? Or literally "Shoes". 
       // Sticking to "Shoes" for sub as requested.
      { name_en: 'Shoes', name_ar: 'أحذية', slug: 'shoes-general', displayOrder: 1 },
      { name_en: 'Sneakers', name_ar: 'سنيكرز', slug: 'shoes-sneakers', displayOrder: 2 },
      { name_en: 'Casual Shoes', name_ar: 'أحذية كاجوال', slug: 'shoes-casual', displayOrder: 3 },
      { name_en: 'Sports Shoes', name_ar: 'أحذية رياضية', slug: 'shoes-sports', displayOrder: 4 },
    ],
  },
]

export async function seedCategories() {
  console.log('Seeding categories...')
  
  // Option: Clear existing categories to ensure clean slate?
  // Since we have foreign keys, we might need to be careful.
  // But usually seed runs after migration reset in dev.
  
  for (const cat of categories) {
    const mainCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name_en: cat.name_en,
        name_ar: cat.name_ar,
        isActive: true,
        displayOrder: cat.displayOrder,
      },
      create: {
        name_en: cat.name_en,
        name_ar: cat.name_ar,
        slug: cat.slug,
        isActive: true,
        displayOrder: cat.displayOrder,
      },
    })
    
    console.log(`Created/Updated main category: ${mainCat.name_en}`)

    if (cat.children) {
      for (const child of cat.children) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: {
            name_en: child.name_en,
            name_ar: child.name_ar,
            parentId: mainCat.id,
            isActive: true,
            displayOrder: child.displayOrder,
          },
          create: {
            name_en: child.name_en,
            name_ar: child.name_ar,
            slug: child.slug,
            parentId: mainCat.id,
            isActive: true,
            displayOrder: child.displayOrder,
          },
        })
        console.log(`  - Created/Updated sub category: ${child.name_en}`)
      }
    }
  }
}

// Allow running directly
if (require.main === module) {
  seedCategories()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
