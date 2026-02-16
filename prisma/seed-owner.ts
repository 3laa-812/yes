
const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = await hash('owner812', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'owner@yes.com' },
    update: {
      role: 'OWNER',
      password: password,
      name: '3laa',
      isActive: true,
      phone: '01000000000', // Dummy phone if needed, or update if exists
    },
    create: {
      email: 'owner@yes.com',
      name: '3laa',
      password: password,
      role: 'OWNER',
      isActive: true,
      phone: '01000000000', // Required unique field
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
