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
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let SeedService = class SeedService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.seedAdmin();
    }
    async seedAdmin() {
        const adminEmail = 'sanjay@kswhospitality.com';
        const password = 'Ksw@123';
        try {
            const passwordHash = await bcrypt.hash(password, 10);
            const existingAdmin = await this.prisma.client.user.findUnique({
                where: { email: adminEmail },
            });
            if (!existingAdmin) {
                console.log('--- Bootstrapping Initial Super Admin ---');
                const org = await this.prisma.client.organization.upsert({
                    where: { slug: 'ksw-hq' },
                    update: {},
                    create: {
                        name: 'KSW Hospitality HQ',
                        slug: 'ksw-hq',
                        enabledModules: ['DASHBOARD', 'HOTEL_MANAGEMENT'],
                    },
                });
                await this.prisma.client.user.create({
                    data: {
                        email: adminEmail,
                        passwordHash,
                        name: 'Sanjay Kumar',
                        role: 'SUPER_ADMIN',
                        organizationId: org.id,
                    },
                });
                console.log(`Initial Admin Created: ${adminEmail} / ${password}`);
            }
            else {
                await this.prisma.client.user.update({
                    where: { email: adminEmail },
                    data: { passwordHash }
                });
                console.log(`Admin ${adminEmail} verified and password reset to default.`);
            }
        }
        catch (error) {
            console.error('Failed to seed initial admin:', error);
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeedService);
//# sourceMappingURL=seed.service.js.map