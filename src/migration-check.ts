import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function runPreFlightCheck() {
  console.log('🏁 Starting safe Multi-Tenant Database Pre-Flight Verification...');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connection established with PostgreSQL successfully.');

    // 1. Check if the database has active organizations
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

      // Check for duplicate slugs which could break unique constraints
      const duplicateCheck = orgsCountResult.rows.filter(row => parseInt(row.count) > 1);
      if (duplicateCheck.length > 0) {
        console.error('⚠️ Critical Warning: Duplicate organization slug collisions detected!', duplicateCheck);
        process.exit(1);
      }
    } else {
      console.log('ℹ️ Fresh database environment detected. "Organization" table does not exist yet.');
    }

    // 2. Check if the invoice table exists and has soft-deletions
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
      } else {
        console.log('ℹ️ "billingSnapshot" column is absent. Ready for migration deployment.');
      }
    }

    client.release();
    console.log('🎉 Pre-Flight Verification Passed! Safe to execute schema migration.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Critical Pre-Flight Check Failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runPreFlightCheck();
