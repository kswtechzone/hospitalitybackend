import { PrismaService } from '../prisma/prisma.service';
import { ValidateCouponDto, CreateCouponDto } from './dto/validate-coupon.dto';
export declare class PromotionService {
    private prisma;
    constructor(prisma: PrismaService);
    createCoupon(dto: CreateCouponDto): Promise<any>;
    listCoupons(organizationId: string): Promise<any>;
    validateCoupon(dto: ValidateCouponDto): Promise<{
        valid: boolean;
        discountAmount: number;
        finalAmount: number;
        appliedCoupon: any;
        reason: string;
    }>;
    redeemCoupon(couponCode: string, amount: number, moduleType: 'POS' | 'PARLOR' | 'HOTEL' | 'ALL', referenceId: string, organizationId: string, customerId?: string): Promise<any>;
}
