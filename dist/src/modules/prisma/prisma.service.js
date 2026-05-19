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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let PrismaService = class PrismaService {
    constructor() {
        const maxConnections = process.env.DATABASE_POOL_MAX ? parseInt(process.env.DATABASE_POOL_MAX) : 20;
        const idleTimeout = process.env.DATABASE_IDLE_TIMEOUT ? parseInt(process.env.DATABASE_IDLE_TIMEOUT) : 30000;
        const connectionTimeout = process.env.DATABASE_CONN_TIMEOUT ? parseInt(process.env.DATABASE_CONN_TIMEOUT) : 5000;
        const pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: maxConnections,
            idleTimeoutMillis: idleTimeout,
            connectionTimeoutMillis: connectionTimeout
        });
        pool.on('error', (err) => {
            console.error('Unexpected database adapter connection pool error:', err);
        });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        const baseClient = new client_1.PrismaClient({ adapter });
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
        await this.client.$connect();
    }
    async onModuleDestroy() {
        await this.client.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map