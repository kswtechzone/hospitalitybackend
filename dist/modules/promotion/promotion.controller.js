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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionController = void 0;
const common_1 = require("@nestjs/common");
const promotion_service_1 = require("./promotion.service");
const validate_coupon_dto_1 = require("./dto/validate-coupon.dto");
let PromotionController = class PromotionController {
    constructor(promotionService) {
        this.promotionService = promotionService;
    }
    async validateCoupon(dto) {
        return this.promotionService.validateCoupon(dto);
    }
    async createCoupon(dto) {
        return this.promotionService.createCoupon(dto);
    }
    async listCoupons(organizationId) {
        return this.promotionService.listCoupons(organizationId);
    }
};
exports.PromotionController = PromotionController;
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_coupon_dto_1.ValidateCouponDto]),
    __metadata("design:returntype", Promise)
], PromotionController.prototype, "validateCoupon", null);
__decorate([
    (0, common_1.Post)('coupon/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], PromotionController.prototype, "createCoupon", null);
__decorate([
    (0, common_1.Get)('coupon/list'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromotionController.prototype, "listCoupons", null);
exports.PromotionController = PromotionController = __decorate([
    (0, common_1.Controller)('promotion'),
    __metadata("design:paramtypes", [promotion_service_1.PromotionService])
], PromotionController);
//# sourceMappingURL=promotion.controller.js.map