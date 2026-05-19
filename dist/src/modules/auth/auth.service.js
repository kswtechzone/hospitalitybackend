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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(data) {
        this.logger.log(`Registering new user: ${data.email} for org: ${data.orgName}`);
        const existingUser = await this.prisma.client.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const existingOrg = await this.prisma.client.organization.findUnique({
            where: { slug: data.orgSlug },
        });
        if (existingOrg) {
            throw new common_1.ConflictException('This organization URL slug is already taken');
        }
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const result = await this.prisma.client.$transaction(async (tx) => {
                const org = await tx.organization.create({
                    data: {
                        name: data.orgName,
                        slug: data.orgSlug,
                        enabledModules: ['DASHBOARD'],
                        brands: {
                            create: {
                                name: data.orgName,
                                slug: data.orgSlug,
                            },
                        },
                    },
                });
                const user = await tx.user.create({
                    data: {
                        email: data.email,
                        passwordHash: hashedPassword,
                        name: data.name,
                        organizationId: org.id,
                        role: 'ORG_ADMIN',
                    },
                    include: { organization: true }
                });
                return user;
            });
            this.logger.log(`Successfully registered: ${data.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Registration failed: ${error.message}`);
            throw new common_1.BadRequestException('Registration failed. Please ensure all data is valid.');
        }
    }
    async login(email, pass) {
        this.logger.log(`Login attempt: ${email}`);
        try {
            const user = await this.prisma.client.user.findUnique({
                where: { email },
                include: { organization: true },
            });
            if (!user) {
                this.logger.warn(`Login failed: User ${email} not found`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            if (!isMatch) {
                this.logger.warn(`Login failed: Password mismatch for ${email}`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const payload = {
                sub: user.id,
                email: user.email,
                orgId: user.organizationId,
                role: user.role
            };
            this.logger.log(`Login successful: ${email}`);
            return {
                accessToken: await this.jwtService.signAsync(payload),
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    organization: user.organization,
                },
            };
        }
        catch (error) {
            this.logger.error(`Login error: ${error.message}`);
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            throw new common_1.BadRequestException('Login failed due to a system error');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map