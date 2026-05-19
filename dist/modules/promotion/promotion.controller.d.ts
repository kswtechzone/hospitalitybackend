import { PromotionService } from './promotion.service';
import { ValidateCouponDto, CreateCouponDto } from './dto/validate-coupon.dto';
export declare class PromotionController {
    private readonly promotionService;
    constructor(promotionService: PromotionService);
    validateCoupon(dto: ValidateCouponDto): Promise<{
        valid: boolean;
        discountAmount: number;
        finalAmount: number;
        appliedCoupon: any;
        reason: string;
    }>;
    createCoupon(dto: CreateCouponDto): Promise<any>;
    listCoupons(organizationId: string): Promise<any>;
}
