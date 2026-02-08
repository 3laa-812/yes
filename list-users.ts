import db from './lib/db';

async function listUsers() {
  const users = await db.user.findMany({
    select: {
      email: true,
      role: true,
      name: true,
    }
  });
  console.log(users);
}

listUsers()
  .catch(console.error)
  .finally(() => db.$disconnect());
