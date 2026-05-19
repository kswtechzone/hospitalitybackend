export class ValidateCouponDto {
  code: string;
  amount: number;
  moduleType: 'POS' | 'PARLOR' | 'HOTEL' | 'ALL';
  customerId?: string;
  organizationId: string;
}

export class CreateCouponDto {
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  organizationId: string;
  scopes?: Array<{ moduleType: string; entityType: string }>;
}
