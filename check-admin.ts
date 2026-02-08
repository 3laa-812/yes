import db from './lib/db';

async function checkUser() {
  const user = await db.user.findUnique({
    where: { email: 'admin@example.com' },
  });
  console.log(user);
}

checkUser()
  .catch(console.error)
  .finally(() => db.$disconnect());
