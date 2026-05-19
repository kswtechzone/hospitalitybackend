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
  const keys = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
  console.log('Available Prisma Models:', keys.join(', '));
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  pool.end();
});
