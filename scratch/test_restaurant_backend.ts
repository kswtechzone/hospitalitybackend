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

async function testBackend() {
  console.log('--- Testing Restaurant Backend ---');
  
  // 1. Get the Organization
  const org = await prisma.organization.findFirst({ where: { slug: 'ksw-hq' } });
  if (!org) {
    console.error('Org not found. Run seed first.');
    return;
  }

  // 2. Create a Restaurant (since we wiped the DB)
  const restaurant = await prisma.restaurant.create({
    data: {
      organizationId: org.id,
      name: 'Test Kitchen',
      description: 'Validation Restaurant'
    }
  });
  console.log('Created Restaurant:', restaurant.id);

  // 3. Create a Menu
  const menu = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Main Menu'
    }
  });
  console.log('Created Menu:', menu.id);

  // 4. Create a Category
  const category = await prisma.menuCategory.create({
    data: {
      menuId: menu.id,
      name: 'Starters'
    }
  });
  console.log('Created Category:', category.id);

  // 5. Create an Item
  const item = await prisma.menuItem.create({
    data: {
      categoryId: category.id,
      name: 'Bruschetta',
      price: 8.5
    }
  });
  console.log('Created Item:', item.id);

  console.log('--- Backend Test Passed ---');
}

testBackend()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
