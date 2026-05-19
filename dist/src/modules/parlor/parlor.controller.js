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
exports.ParlorController = void 0;
const common_1 = require("@nestjs/common");
const parlor_service_1 = require("./parlor.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_guard_1 = require("../auth/tenant.guard");
let ParlorController = class ParlorController {
    constructor(parlorService) {
        this.parlorService = parlorService;
    }
    getCategories(req) {
        return this.parlorService.getCategories(req.tenantId);
    }
    createCategory(name, req) {
        return this.parlorService.createCategory(req.tenantId, name);
    }
    getServices(req) {
        return this.parlorService.getServices(req.tenantId);
    }
    createService(data, req) {
        return this.parlorService.createService(req.tenantId, data);
    }
    updateService(id, data, req) {
        return this.parlorService.updateService(req.tenantId, id, data);
    }
    getBookings(req) {
        return this.parlorService.getBookings(req.tenantId);
    }
    createBooking(data, req) {
        return this.parlorService.createBooking(req.tenantId, data);
    }
    updateBookingStatus(id, req, status, paymentStatus, bookingTime) {
        return this.parlorService.updateBookingStatus(req.tenantId, id, status, paymentStatus, bookingTime);
    }
};
exports.ParlorController = ParlorController;
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParlorController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ParlorController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('services'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParlorController.prototype, "getServices", null);
__decorate([
    (0, common_1.Post)('services'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ParlorController.prototype, "createService", null);
__decorate([
    (0, common_1.Patch)('services/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ParlorController.prototype, "updateService", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParlorController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Post)('bookings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ParlorController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('status')),
    __param(3, (0, common_1.Body)('paymentStatus')),
    __param(4, (0, common_1.Body)('bookingTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ParlorController.prototype, "updateBookingStatus", null);
exports.ParlorController = ParlorController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Controller)('api/v1/parlor'),
    __metadata("design:paramtypes", [parlor_service_1.ParlorService])
], ParlorController);
//# sourceMappingURL=parlor.controller.js.map