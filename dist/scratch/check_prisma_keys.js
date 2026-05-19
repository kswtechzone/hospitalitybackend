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
    const keys = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
    console.log('Available Prisma Models:', keys.join(', '));
}
main().catch(console.error).finally(() => {
    prisma.$disconnect();
    pool.end();
});
//# sourceMappingURL=check_prisma_keys.js.map