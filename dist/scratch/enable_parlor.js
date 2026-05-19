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
//# sourceMappingURL=enable_parlor.js.map