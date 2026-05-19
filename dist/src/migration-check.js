"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function runPreFlightCheck() {
    console.log('🏁 Starting safe Multi-Tenant Database Pre-Flight Verification...');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ Error: DATABASE_URL environment variable is missing.');
        process.exit(1);
    }
    const pool = new pg_1.Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });
    try {
        const client = await pool.connect();
        console.log('✅ Connection established with PostgreSQL successfully.');
        const orgTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Organization'
      );
    `);
        const hasOrgTable = orgTableCheck.rows[0].exists;
        if (hasOrgTable) {
            console.log('📊 "Organization" table detected. Inspecting tenant data safety...');
            const orgsCountResult = await client.query('SELECT COUNT(*), slug FROM "Organization" GROUP BY slug');
            const totalOrgs = orgsCountResult.rows.length;
            console.log(`ℹ️ Detected ${totalOrgs} registered organization tenant(s).`);
            const duplicateCheck = orgsCountResult.rows.filter(row => parseInt(row.count) > 1);
            if (duplicateCheck.length > 0) {
                console.error('⚠️ Critical Warning: Duplicate organization slug collisions detected!', duplicateCheck);
                process.exit(1);
            }
        }
        else {
            console.log('ℹ️ Fresh database environment detected. "Organization" table does not exist yet.');
        }
        const invoiceTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Invoice'
      );
    `);
        const hasInvoiceTable = invoiceTableCheck.rows[0].exists;
        if (hasInvoiceTable) {
            const invoiceSnapshotCheck = await client.query(`
        SELECT COLUMN_NAME FROM information_schema.columns 
        WHERE table_name = 'Invoice' AND column_name = 'billingSnapshot';
      `);
            if (invoiceSnapshotCheck.rows.length > 0) {
                console.log('✅ "billingSnapshot" column already exists in the "Invoice" schema.');
            }
            else {
                console.log('ℹ️ "billingSnapshot" column is absent. Ready for migration deployment.');
            }
        }
        client.release();
        console.log('🎉 Pre-Flight Verification Passed! Safe to execute schema migration.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Critical Pre-Flight Check Failed:', error);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
runPreFlightCheck();
//# sourceMappingURL=migration-check.js.map