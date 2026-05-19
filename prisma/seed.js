const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Create Demo Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'ksw-hq' },
    update: {},
    create: {
      name: 'KSW Hospitality Headquarters',
      slug: 'ksw-hq',
      enabledModules: ['DASHBOARD', 'HOTEL_MANAGEMENT'],
    },
  });

  // 2. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kswhospitality.com' },
    update: {},
    create: {
      email: 'admin@kswhospitality.com',
      passwordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      organizationId: org.id,
    },
  });

  console.log('--- Seeding Completed ---');
  console.log('Super Admin: admin@kswhospitality.com / Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
