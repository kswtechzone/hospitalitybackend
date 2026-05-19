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
//# sourceMappingURL=add-restaurant.js.map