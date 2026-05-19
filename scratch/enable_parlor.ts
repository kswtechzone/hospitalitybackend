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
  const orgs = await prisma.organization.findMany();
  for (const org of orgs) {
    const modules = new Set(org.enabledModules);
    modules.add('PARLOR');
    modules.add('HOTEL_MANAGEMENT');
    modules.add('RESTAURANT');
    modules.add('POS');
    modules.add('INVENTORY');
    modules.add('HR');
    modules.add('FINANCE');
    modules.add('WEBSITE');
    
    await prisma.organization.update({
      where: { id: org.id },
      data: { enabledModules: Array.from(modules) }
    });
    console.log(`Updated modules for ${org.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
