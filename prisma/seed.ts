import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Create Essential KSW Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'ksw-hq' },
    update: {},
    create: {
      name: 'KSWMS Headquarters',
      slug: 'ksw-hq',
      enabledModules: ['DASHBOARD', 'HOTEL_MANAGEMENT', 'POS', 'RESTAURANT', 'WEBSITE', 'INVENTORY', 'HR', 'FINANCE'],
    },
  });

  // 2. Create Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@kswtechzone.com.np' },
    update: {},
    create: {
      email: 'admin@kswtechzone.com.np',
      passwordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      organizationId: org.id,
    },
  });

  console.log('--- Production Baseline Seeded ---');
  console.log('Super Admin: admin@kswtechzone.com.np / Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
