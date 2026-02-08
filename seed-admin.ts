import db from './lib/db';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash('admin', 10);
  
  const user = await db.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      role: 'OWNER',
      password: hashedPassword,
    },
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      role: 'OWNER',
      password: hashedPassword,
      isActive: true,
    },
  });
  
  console.log('Admin user seeded:', user);
}

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
