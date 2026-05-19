import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidateCouponDto, CreateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class PromotionService {
  constructor(private prisma: PrismaService) {}

  async createCoupon(dto: CreateCouponDto) {
    const existing = await this.prisma.client.coupon.findFirst({
      where: {
        organizationId: dto.organizationId,
        code: dto.code.toUpperCase(),
      },
    });

    if (existing) {
      throw new BadRequestException(`Coupon with code ${dto.code} already exists for this organization.`);
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

  async listCoupons(organizationId: string) {
    return this.prisma.client.coupon.findMany({
      where: { organizationId },
      include: { scopes: true },
    });
  }

  async validateCoupon(dto: ValidateCouponDto) {
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

    // 1. Validate date bounds
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

    // 2. Validate spending minimums
    if (dto.amount < coupon.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: dto.amount,
        appliedCoupon: coupon.code,
        reason: `Minimum order amount of ${coupon.minOrderValue} required for this coupon`,
      };
    }

    // 3. Validate modules/scopes
    if (coupon.scopes.length > 0) {
      const isAllowedScope = coupon.scopes.some(
        s => s.moduleType === 'ALL' || s.moduleType === dto.moduleType
      );

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

    // 4. Validate global usage limits
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

    // 5. Validate customer/per-user limits
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

    // 6. Compute discount details
    let discountAmount = 0;
    if (coupon.type === 'PERCENT') {
      discountAmount = (dto.amount * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'FIXED') {
      discountAmount = coupon.value;
    }

    // Cap discount amount to original total price
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

  async redeemCoupon(couponCode: string, amount: number, moduleType: 'POS' | 'PARLOR' | 'HOTEL' | 'ALL', referenceId: string, organizationId: string, customerId?: string) {
    const validation = await this.validateCoupon({
      code: couponCode,
      amount,
      moduleType,
      customerId,
      organizationId,
    });

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    const coupon = await this.prisma.client.coupon.findFirst({
      where: {
        organizationId,
        code: couponCode.toUpperCase(),
        isActive: true,
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
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
}
