import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('admin123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'owner@admin.com' },
    update: {},
    create: {
      email: 'owner@admin.com',
      name: 'Owner Admin',
      password,
      role: Role.OWNER,
      isActive: true,
    },
  })
  console.log({ user })
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
