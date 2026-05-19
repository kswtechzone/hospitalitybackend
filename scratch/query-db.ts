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
  const email = 'test-kswuser-second-5678@kswtechzone.com.np';
  const hashedPassword = await bcrypt.hash('Password123', 10);
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      let org = await tx.organization.findUnique({
        where: { slug: 'kswuser' },
      });

      console.log('Found Org:', org);

      if (!org) {
        console.log('Creating Org...');
        org = await tx.organization.create({
          data: {
            name: 'KSWUSER Organization',
            slug: 'kswuser',
            enabledModules: ['DASHBOARD'],
            brands: {
              create: {
                name: 'KSWUSER',
                slug: 'kswuser',
              },
            },
          },
        });
      }

      console.log('Creating User under Org ID:', org.id);
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name: 'Test KSWUser Second',
          organizationId: org.id,
          role: 'ORG_ADMIN',
        },
        include: { organization: true }
      });

      return user;
    });

    console.log('Transaction Success:', result);
  } catch (error: any) {
    console.error('--- Transaction Error ---');
    console.error(error);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
