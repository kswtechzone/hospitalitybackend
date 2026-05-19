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
exports.PromotionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PromotionService = class PromotionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCoupon(dto) {
        const existing = await this.prisma.client.coupon.findFirst({
            where: {
                organizationId: dto.organizationId,
                code: dto.code.toUpperCase(),
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Coupon with code ${dto.code} already exists for this organization.`);
        }
        return this.prisma.client.coupon.create({
            data: {
                organizationId: dto.organizationId,
                code: dto.code.toUpperCase(),
                type: dto.type,
                value: dto.value,
                minOrderValue: dto.minOrderValue ?? 0,
                maxDiscount: dto.maxDiscount,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                usageLimit: dto.usageLimit ?? 999999,
                perUserLimit: dto.perUserLimit ?? 1,
                isActive: true,
                scopes: dto.scopes ? {
                    create: dto.scopes.map(s => ({
                        moduleType: s.moduleType,
                        entityType: s.entityType,
                    })),
                } : undefined,
            },
            include: {
                scopes: true,
            },
        });
    }
    async listCoupons(organizationId) {
        return this.prisma.client.coupon.findMany({
            where: { organizationId },
            include: { scopes: true },
        });
    }
    async validateCoupon(dto) {
        const coupon = await this.prisma.client.coupon.findFirst({
            where: {
                organizationId: dto.organizationId,
                code: dto.code.toUpperCase(),
                isActive: true,
            },
            include: {
                scopes: true,
            },
        });
        if (!coupon) {
            return {
                valid: false,
                discountAmount: 0,
                finalAmount: dto.amount,
                appliedCoupon: dto.code,
                reason: 'Coupon not found or is currently inactive',
            };
        }
        const now = new Date();
        if (now < coupon.startDate) {
            return {
                valid: false,
                discountAmount: 0,
                finalAmount: dto.amount,
                appliedCoupon: coupon.code,
                reason: 'Coupon is not active yet (starts ' + coupon.startDate.toLocaleDateString() + ')',
            };
        }
        if (now > coupon.endDate) {
            return {
                valid: false,
                discountAmount: 0,
                finalAmount: dto.amount,
                appliedCoupon: coupon.code,
                reason: 'Coupon has expired',
            };
        }
        if (dto.amount < coupon.minOrderValue) {
            return {
                valid: false,
                discountAmount: 0,
                finalAmount: dto.amount,
                appliedCoupon: coupon.code,
                reason: `Minimum order amount of ${coupon.minOrderValue} required for this coupon`,
            };
        }
        if (coupon.scopes.length > 0) {
            const isAllowedScope = coupon.scopes.some(s => s.moduleType === 'ALL' || s.moduleType === dto.moduleType);
            if (!isAllowedScope) {
                return {
                    valid: false,
                    discountAmount: 0,
                    finalAmount: dto.amount,
                    appliedCoupon: coupon.code,
                    reason: `Coupon is not applicable to the ${dto.moduleType} module`,
                };
            }
        }
        const redemptionCount = await this.prisma.client.couponRedemption.count({
            where: { couponId: coupon.id },
        });
        if (redemptionCount >= coupon.usageLimit) {
            return {
                valid: false,
                discountAmount: 0,
                finalAmount: dto.amount,
                appliedCoupon: coupon.code,
                reason: 'Coupon global usage limit has been fully exhausted',
            };
        }
        if (dto.customerId) {
            const userRedemptions = await this.prisma.client.couponRedemption.count({
                where: {
                    couponId: coupon.id,
                    userId: dto.customerId,
                },
            });
            if (userRedemptions >= coupon.perUserLimit) {
                return {
                    valid: false,
                    discountAmount: 0,
                    finalAmount: dto.amount,
                    appliedCoupon: coupon.code,
                    reason: `You have reached the maximum utilization limit (${coupon.perUserLimit}) for this coupon`,
                };
            }
        }
        let discountAmount = 0;
        if (coupon.type === 'PERCENT') {
            discountAmount = (dto.amount * coupon.value) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        }
        else if (coupon.type === 'FIXED') {
            discountAmount = coupon.value;
        }
        if (discountAmount > dto.amount) {
            discountAmount = dto.amount;
        }
        return {
            valid: true,
            discountAmount,
            finalAmount: dto.amount - discountAmount,
            appliedCoupon: coupon.code,
            reason: 'Coupon successfully validated and calculated',
        };
    }
    async redeemCoupon(couponCode, amount, moduleType, referenceId, organizationId, customerId) {
        const validation = await this.validateCoupon({
            code: couponCode,
            amount,
            moduleType,
            customerId,
            organizationId,
        });
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.reason);
        }
        const coupon = await this.prisma.client.coupon.findFirst({
            where: {
                organizationId,
                code: couponCode.toUpperCase(),
                isActive: true,
            },
        });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        return this.prisma.client.couponRedemption.create({
            data: {
                couponId: coupon.id,
                userId: customerId,
                organizationId,
                referenceId,
                discountApplied: validation.discountAmount,
            },
        });
    }
};
exports.PromotionService = PromotionService;
exports.PromotionService = PromotionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionService);
//# sourceMappingURL=promotion.service.js.map