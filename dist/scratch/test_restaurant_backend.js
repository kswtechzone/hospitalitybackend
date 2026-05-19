"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
require("dotenv/config");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function testBackend() {
    console.log('--- Testing Restaurant Backend ---');
    const org = await prisma.organization.findFirst({ where: { slug: 'ksw-hq' } });
    if (!org) {
        console.error('Org not found. Run seed first.');
        return;
    }
    const restaurant = await prisma.restaurant.create({
        data: {
            organizationId: org.id,
            name: 'Test Kitchen',
            description: 'Validation Restaurant'
        }
    });
    console.log('Created Restaurant:', restaurant.id);
    const menu = await prisma.menu.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Main Menu'
        }
    });
    console.log('Created Menu:', menu.id);
    const category = await prisma.menuCategory.create({
        data: {
            menuId: menu.id,
            name: 'Starters'
        }
    });
    console.log('Created Category:', category.id);
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
//# sourceMappingURL=test_restaurant_backend.js.map