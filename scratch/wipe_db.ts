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

async function wipe() {
  console.log('--- Wiping Database via Truncate ---');
  
  const tables = [
    'OrderItem', 'Order', 'MenuItem', 'MenuCategory', 'Menu',
    'InventoryTransaction', 'InventoryItem', 'Attendance', 'Staff',
    'Expense', 'Invoice', 'Booking', 'GuestProfile', 'Table',
    'Room', 'Restaurant', 'CMSSection', 'CMSPage', 'Website',
    'Hotel', 'Brand', 'ActivityLog', 'User', 'Organization'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`Truncated ${table}`);
    } catch (e) {
      console.warn(`Failed to truncate ${table} (might not exist)`);
    }
  }

  console.log('--- Database Wiped ---');
}

wipe()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
