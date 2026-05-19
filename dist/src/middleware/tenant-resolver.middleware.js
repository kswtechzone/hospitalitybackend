"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantResolverMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../modules/prisma/prisma.service");
let TenantResolverMiddleware = class TenantResolverMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        const host = req.headers.host || '';
        let website = null;
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            const subdomain = host.split('.')[0];
            if (subdomain !== 'localhost' && subdomain !== '127') {
                website = await this.prisma.client.website.findUnique({
                    where: { subdomain }
                });
            }
        }
        else {
            const isCustomDomain = !host.includes('kswhospitality.com');
            if (isCustomDomain) {
                website = await this.prisma.client.website.findUnique({
                    where: { customDomain: host }
                });
            }
            else {
                const subdomain = host.split('.')[0];
                website = await this.prisma.client.website.findUnique({
                    where: { subdomain }
                });
            }
        }
        if (website) {
            req.resolvedTenantId = website.organizationId;
            req.resolvedWebsiteId = website.id;
        }
        next();
    }
};
exports.TenantResolverMiddleware = TenantResolverMiddleware;
exports.TenantResolverMiddleware = TenantResolverMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantResolverMiddleware);
//# sourceMappingURL=tenant-resolver.middleware.js.map