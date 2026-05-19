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
exports.IdentityService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let IdentityService = class IdentityService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(data) {
        const { username, email, phone, password } = data;
        if (!username || !email || !password) {
            throw new common_1.BadRequestException('Username, email, and password are required');
        }
        const existingUser = await this.prisma.client.platformUser.findFirst({
            where: {
                OR: [
                    { username },
                    { email },
                    ...(phone ? [{ phone }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A platform user with this username, email, or phone already exists');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.client.platformUser.create({
            data: {
                username,
                email,
                phone: phone || null,
                passwordHash,
                isVerified: true,
            },
        });
        return this.generateAuthTokens(user, null, 'STAFF');
    }
    async login(data) {
        const { username, password } = data;
        if (!username || !password) {
            throw new common_1.BadRequestException('Username and password are required');
        }
        const user = await this.prisma.client.platformUser.findFirst({
            where: {
                OR: [
                    { username },
                    { email: username },
                ],
            },
            include: {
                memberships: {
                    include: {
                        organization: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid platform credentials');
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid platform credentials');
        }
        const activeMembership = user.memberships[0] || null;
        const orgId = activeMembership?.organizationId || '';
        const role = activeMembership?.role || 'STAFF';
        return this.generateAuthTokens(user, orgId, role);
    }
    async refresh(refreshToken) {
        try {
            const decoded = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_SECRET_KEY || 'ksw_central_secret_key_2026',
            });
            const user = await this.prisma.client.platformUser.findUnique({
                where: { id: decoded.userId || decoded.sub },
                include: {
                    memberships: true,
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Platform user not found');
            }
            const activeMembership = user.memberships[0] || null;
            const orgId = activeMembership?.organizationId || '';
            const role = activeMembership?.role || 'STAFF';
            return this.generateAuthTokens(user, orgId, role);
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async getProfile(userId) {
        const user = await this.prisma.client.platformUser.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                isVerified: true,
                createdAt: true,
                memberships: {
                    include: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                subscriptionPlan: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Platform user not found');
        return user;
    }
    async generateAuthTokens(user, organizationId, role) {
        const payload = {
            userId: user.id,
            sub: user.id,
            email: user.email,
            organizationId: organizationId || '',
            role,
            permissions: organizationId ? ['READ', 'WRITE'] : [],
            accessibleSystems: ['hospitality', 'crm', 'pos', 'website'],
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_KEY || 'ksw_central_secret_key_2026',
            expiresIn: '1h',
        });
        const refreshToken = this.jwtService.sign({ userId: user.id, purpose: 'refresh' }, {
            secret: process.env.JWT_SECRET_KEY || 'ksw_central_secret_key_2026',
            expiresIn: '7d',
        });
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                activeMembership: organizationId
                    ? {
                        organizationId,
                        role,
                    }
                    : null,
            },
        };
    }
    async createOrganization(data) {
        const { name, slug, subscriptionPlan } = data;
        if (!name || !slug) {
            throw new common_1.BadRequestException('Organization name and URL slug are required');
        }
        const existing = await this.prisma.client.organization.findUnique({
            where: { slug },
        });
        if (existing) {
            throw new common_1.ConflictException('An organization with this URL slug already exists');
        }
        return this.prisma.client.organization.create({
            data: {
                name,
                slug,
                subscriptionPlan: subscriptionPlan || 'FREE',
                enabledModules: ['DASHBOARD'],
            },
        });
    }
    async inviteUserToOrganization(orgId, inviteData) {
        const { email, role } = inviteData;
        if (!email)
            throw new common_1.BadRequestException('Invite email address is required');
        const organization = await this.prisma.client.organization.findUnique({
            where: { id: orgId },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found');
        const user = await this.prisma.client.platformUser.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('Platform User not registered. Please register on kswtechzone.com first.');
        }
        const existingMembership = await this.prisma.client.organizationMembership.findUnique({
            where: {
                organizationId_platformUserId: {
                    organizationId: orgId,
                    platformUserId: user.id,
                },
            },
        });
        if (existingMembership) {
            throw new common_1.ConflictException('User is already a member of this organization');
        }
        return this.prisma.client.organizationMembership.create({
            data: {
                organizationId: orgId,
                platformUserId: user.id,
                role: role || 'STAFF',
                status: 'ACTIVE',
            },
        });
    }
    async linkCustomerToOrganization(orgId, customerData) {
        const { fullName, phone, email, notes, tags } = customerData;
        if (!fullName)
            throw new common_1.BadRequestException('Customer fullName is required');
        if (!phone && !email) {
            throw new common_1.BadRequestException('Either telephone number or email address is required for unique matching');
        }
        const existingGlobal = await this.prisma.client.customer.findFirst({
            where: {
                OR: [
                    ...(phone ? [{ phone }] : []),
                    ...(email ? [{ email }] : []),
                ],
            },
        });
        let customerId;
        if (existingGlobal) {
            customerId = existingGlobal.id;
            if ((phone && !existingGlobal.phone) || (email && !existingGlobal.email)) {
                await this.prisma.client.customer.update({
                    where: { id: customerId },
                    data: {
                        phone: existingGlobal.phone || phone,
                        email: existingGlobal.email || email,
                    },
                });
            }
        }
        else {
            const newCust = await this.prisma.client.customer.create({
                data: {
                    fullName,
                    phone: phone || null,
                    email: email || null,
                },
            });
            customerId = newCust.id;
        }
        const existingLink = await this.prisma.client.customerOrganization.findUnique({
            where: {
                customerId_organizationId: {
                    customerId,
                    organizationId: orgId,
                },
            },
        });
        if (existingLink) {
            return this.prisma.client.customerOrganization.update({
                where: { id: existingLink.id },
                data: {
                    notes: notes ? { note: notes } : existingLink.notes,
                    tags: tags || existingLink.tags,
                },
                include: { customer: true },
            });
        }
        return this.prisma.client.customerOrganization.create({
            data: {
                customerId,
                organizationId: orgId,
                loyaltyPoints: 0,
                notes: notes ? { note: notes } : {},
                tags: tags || [],
            },
            include: { customer: true },
        });
    }
};
exports.IdentityService = IdentityService;
exports.IdentityService = IdentityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], IdentityService);
//# sourceMappingURL=identity.service.js.map