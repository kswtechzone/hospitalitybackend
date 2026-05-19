import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { ValidateCouponDto, CreateCouponDto } from './dto/validate-coupon.dto';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post('validate')
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.promotionService.validateCoupon(dto);
  }

  @Post('coupon/create')
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.promotionService.createCoupon(dto);
  }

  @Get('coupon/list')
  async listCoupons(@Query('organizationId') organizationId: string) {
    return this.promotionService.listCoupons(organizationId);
  }
}
