import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: any;

  constructor() {
    const maxConnections = process.env.DATABASE_POOL_MAX ? parseInt(process.env.DATABASE_POOL_MAX) : 20;
    const idleTimeout = process.env.DATABASE_IDLE_TIMEOUT ? parseInt(process.env.DATABASE_IDLE_TIMEOUT) : 30000;
    const connectionTimeout = process.env.DATABASE_CONN_TIMEOUT ? parseInt(process.env.DATABASE_CONN_TIMEOUT) : 5000;

    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: maxConnections,
      idleTimeoutMillis: idleTimeout,
      connectionTimeoutMillis: connectionTimeout
    });

    pool.on('error', (err) => {
      console.error('Unexpected database adapter connection pool error:', err);
    });

    const adapter = new PrismaPg(pool);
    const baseClient = new PrismaClient({ adapter });

    
    const softDeleteModels = [
      'Organization', 'Brand', 'User', 'Hotel', 'Room', 'Booking', 
      'Website', 'Restaurant'
    ];

    this.client = baseClient.$extends({
      query: {
        $allModels: {
          async findMany({ model, args, query }) {
            if (softDeleteModels.includes(model)) {
              args.where = { deletedAt: null, ...args.where };
            }
            return query(args);
          },
          async findFirst({ model, args, query }) {
            if (softDeleteModels.includes(model)) {
              args.where = { deletedAt: null, ...args.where };
            }
            return query(args);
          },
          async findUnique({ args, query }) {
            return query(args);
          }
        }
      }
    });
  }

  async onModuleInit() {
    await (this.client as any).$connect();
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect();
  }
}
