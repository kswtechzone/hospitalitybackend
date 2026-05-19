import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const org = await prisma.organization.findFirst();
  if (org) {
    const modules = new Set(org.enabledModules);
    modules.add('RESTAURANT');
    await prisma.organization.update({
      where: { id: org.id },
      data: { enabledModules: Array.from(modules) }
    });
    console.log('Added RESTAURANT to org:', org.id);
  }
}
main().finally(() => { prisma.$disconnect(); pool.end(); });
