import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../public/cache.service';
import { PromotionService } from '../promotion/promotion.service';

@Injectable()
export class ParlorService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private promotionService: PromotionService,
  ) {}

  // Category Management
  async getCategories(orgId: string) {
    return this.prisma.client.parlorCategory.findMany({
      where: { organizationId: orgId },
      include: { services: true }
    });
  }

  async createCategory(orgId: string, name: string) {
    return this.prisma.client.parlorCategory.create({
      data: { name, organizationId: orgId }
    });
  }

  // Service Management
  async getServices(orgId: string) {
    return this.prisma.client.parlorService.findMany({
      where: { organizationId: orgId, isActive: true },
      include: { category: true }
    });
  }

  async createService(orgId: string, data: any) {
    return this.prisma.client.parlorService.create({
      data: {
        ...data,
        organizationId: orgId,
      },
    });
  }

  async updateService(orgId: string, serviceId: string, data: any) {
    const { category, ...rest } = data; // Strip category relation if present in body
    const result = await this.prisma.client.parlorService.updateMany({
      where: { id: serviceId, organizationId: orgId },
      data: rest,
    });

    // CQRS Cache Invalidation
    try {
      const org = await this.prisma.client.organization.findUnique({
        where: { id: orgId },
        select: { slug: true }
      });
      if (org) {
        this.cache.clearTenantCache(org.slug);
      }
    } catch (err) {
      console.error('Failed to invalidate parlor services cache:', err);
    }

    return result;
  }

  // Booking Management
  async getBookings(orgId: string) {
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

  async createBooking(orgId: string, data: any) {
    const { serviceIds, discount, ...bookingData } = data;
    
    const services = await this.prisma.client.parlorService.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length === 0) throw new NotFoundException('No valid services found');

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
        throw new BadRequestException(validation.reason);
      }

      discountAmount = validation.discountAmount;
      appliedCoupon = data.couponCode.toUpperCase();
    }

    const totalPrice = Math.max(0, basePrice - discountAmount);

    // Dynamic defaults for POS bookings
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
      await this.promotionService.redeemCoupon(
        appliedCoupon,
        basePrice,
        'PARLOR',
        parlorBooking.id,
        orgId,
        data.customerId,
      );
    }

    // Auto-create Guest KSW Profile if requested
    if (data.registerCustomerProfile) {
      try {
        const orConditions = [];
        if (bookingData.guestPhone) orConditions.push({ phone: bookingData.guestPhone });
        if (bookingData.guestEmail) orConditions.push({ email: bookingData.guestEmail });

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
              isKswProfile: true, // Unified customer KSW login profile representation
              preferences: bookingData.notes ? { note: bookingData.notes } : {},
            },
          });
        }
      } catch (err) {
        console.error('Failed to create customer profile from POS:', err);
      }
    }

    // CQRS Cache Invalidation
    try {
      const org = await this.prisma.client.organization.findUnique({
        where: { id: orgId },
        select: { slug: true }
      });
      if (org) {
        this.cache.clearTenantCache(org.slug);
      }
    } catch (err) {
      console.error('Failed to invalidate parlor services cache:', err);
    }

    return parlorBooking;
  }

  async updateBookingStatus(orgId: string, bookingId: string, status: string, paymentStatus?: string, bookingTime?: string) {
    const dataToUpdate: any = { status };
    if (paymentStatus) {
      dataToUpdate.paymentStatus = paymentStatus;
    } else if (status === 'REFUNDED') {
      dataToUpdate.paymentStatus = 'REFUNDED';
    }

    if (bookingTime) {
      dataToUpdate.bookingTime = new Date(bookingTime);
    }

    const result = await this.prisma.client.serviceBooking.updateMany({
      where: { id: bookingId, organizationId: orgId },
      data: dataToUpdate,
    });

    // CQRS Cache Invalidation
    try {
      const org = await this.prisma.client.organization.findUnique({
        where: { id: orgId },
        select: { slug: true }
      });
      if (org) {
        this.cache.clearTenantCache(org.slug);
      }
    } catch (err) {
      console.error('Failed to invalidate parlor services cache:', err);
    }

    return result;
  }
}
