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
exports.ParlorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cache_service_1 = require("../public/cache.service");
const promotion_service_1 = require("../promotion/promotion.service");
let ParlorService = class ParlorService {
    constructor(prisma, cache, promotionService) {
        this.prisma = prisma;
        this.cache = cache;
        this.promotionService = promotionService;
    }
    async getCategories(orgId) {
        return this.prisma.client.parlorCategory.findMany({
            where: { organizationId: orgId },
            include: { services: true }
        });
    }
    async createCategory(orgId, name) {
        return this.prisma.client.parlorCategory.create({
            data: { name, organizationId: orgId }
        });
    }
    async getServices(orgId) {
        return this.prisma.client.parlorService.findMany({
            where: { organizationId: orgId, isActive: true },
            include: { category: true }
        });
    }
    async createService(orgId, data) {
        return this.prisma.client.parlorService.create({
            data: {
                ...data,
                organizationId: orgId,
            },
        });
    }
    async updateService(orgId, serviceId, data) {
        const { category, ...rest } = data;
        const result = await this.prisma.client.parlorService.updateMany({
            where: { id: serviceId, organizationId: orgId },
            data: rest,
        });
        try {
            const org = await this.prisma.client.organization.findUnique({
                where: { id: orgId },
                select: { slug: true }
            });
            if (org) {
                this.cache.clearTenantCache(org.slug);
            }
        }
        catch (err) {
            console.error('Failed to invalidate parlor services cache:', err);
        }
        return result;
    }
    async getBookings(orgId) {
        return this.prisma.client.serviceBooking.findMany({
            where: { organizationId: orgId },
            include: {
                services: {
                    include: { service: true }
                }
            },
            orderBy: { bookingTime: 'desc' },
        });
    }
    async createBooking(orgId, data) {
        const { serviceIds, discount, ...bookingData } = data;
        const services = await this.prisma.client.parlorService.findMany({
            where: { id: { in: serviceIds } },
        });
        if (services.length === 0)
            throw new common_1.NotFoundException('No valid services found');
        const basePrice = services.reduce((sum, s) => sum + s.price, 0);
        let discountAmount = Number(discount || 0);
        let appliedCoupon = null;
        if (data.couponCode) {
            const validation = await this.promotionService.validateCoupon({
                code: data.couponCode,
                amount: basePrice,
                moduleType: 'PARLOR',
                customerId: data.customerId,
                organizationId: orgId,
            });
            if (!validation.valid) {
                throw new common_1.BadRequestException(validation.reason);
            }
            discountAmount = validation.discountAmount;
            appliedCoupon = data.couponCode.toUpperCase();
        }
        const totalPrice = Math.max(0, basePrice - discountAmount);
        const paymentMethod = bookingData.paymentMethod || 'PAY_ON_VISIT';
        const paymentStatus = (paymentMethod === 'CASH' || paymentMethod === 'CARD') ? 'PAID' : 'UNPAID';
        const bookingStatus = (paymentMethod === 'CASH' || paymentMethod === 'CARD') ? 'CONFIRMED' : 'PENDING';
        const parlorBooking = await this.prisma.client.serviceBooking.create({
            data: {
                guestName: bookingData.guestName,
                guestPhone: bookingData.guestPhone,
                guestEmail: bookingData.guestEmail,
                bookingTime: bookingData.bookingTime,
                notes: bookingData.notes || null,
                status: bookingStatus,
                paymentMethod,
                paymentStatus,
                organizationId: orgId,
                totalPrice,
                services: {
                    create: services.map(s => ({
                        serviceId: s.id,
                        priceAtBooking: s.price
                    }))
                }
            },
            include: { services: true }
        });
        if (appliedCoupon) {
            await this.promotionService.redeemCoupon(appliedCoupon, basePrice, 'PARLOR', parlorBooking.id, orgId, data.customerId);
        }
        if (data.registerCustomerProfile) {
            try {
                const orConditions = [];
                if (bookingData.guestPhone)
                    orConditions.push({ phone: bookingData.guestPhone });
                if (bookingData.guestEmail)
                    orConditions.push({ email: bookingData.guestEmail });
                const existing = orConditions.length > 0
                    ? await this.prisma.client.guestProfile.findFirst({
                        where: {
                            organizationId: orgId,
                            OR: orConditions,
                        },
                    })
                    : null;
                if (!existing) {
                    await this.prisma.client.guestProfile.create({
                        data: {
                            organizationId: orgId,
                            name: bookingData.guestName,
                            phone: bookingData.guestPhone || null,
                            email: bookingData.guestEmail || null,
                            isKswProfile: true,
                            preferences: bookingData.notes ? { note: bookingData.notes } : {},
                        },
                    });
                }
            }
            catch (err) {
                console.error('Failed to create customer profile from POS:', err);
            }
        }
        try {
            const org = await this.prisma.client.organization.findUnique({
                where: { id: orgId },
                select: { slug: true }
            });
            if (org) {
                this.cache.clearTenantCache(org.slug);
            }
        }
        catch (err) {
            console.error('Failed to invalidate parlor services cache:', err);
        }
        return parlorBooking;
    }
    async updateBookingStatus(orgId, bookingId, status, paymentStatus, bookingTime) {
        const dataToUpdate = { status };
        if (paymentStatus) {
            dataToUpdate.paymentStatus = paymentStatus;
        }
        else if (status === 'REFUNDED') {
            dataToUpdate.paymentStatus = 'REFUNDED';
        }
        if (bookingTime) {
            dataToUpdate.bookingTime = new Date(bookingTime);
        }
        const result = await this.prisma.client.serviceBooking.updateMany({
            where: { id: bookingId, organizationId: orgId },
            data: dataToUpdate,
        });
        try {
            const org = await this.prisma.client.organization.findUnique({
                where: { id: orgId },
                select: { slug: true }
            });
            if (org) {
                this.cache.clearTenantCache(org.slug);
            }
        }
        catch (err) {
            console.error('Failed to invalidate parlor services cache:', err);
        }
        return result;
    }
};
exports.ParlorService = ParlorService;
exports.ParlorService = ParlorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService,
        promotion_service_1.PromotionService])
], ParlorService);
//# sourceMappingURL=parlor.service.js.map