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
        }
        catch (e) {
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
//# sourceMappingURL=wipe_db.js.map