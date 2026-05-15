import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const adminEmail = 'geral@rankpanda.pt';
  const adminPassword = 'Passwordidade01!';

  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log(`Admin user ${adminEmail} already exists.`);
    return;
  }

  const hashedPassword = await bcryptjs.hash(adminPassword, 10);

  const adminUser = await db.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
