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
exports.SchedulingController = void 0;
const common_1 = require("@nestjs/common");
const scheduling_service_1 = require("./scheduling.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_guard_1 = require("../auth/tenant.guard");
let SchedulingController = class SchedulingController {
    constructor(schedulingService) {
        this.schedulingService = schedulingService;
    }
    async getPublicAvailability(resourceId, date, duration) {
        if (!resourceId || !date) {
            throw new common_1.BadRequestException('Query parameters resourceId and date are required');
        }
        const slotDuration = duration ? parseInt(duration, 10) : 60;
        const slots = await this.schedulingService.calculateAvailableSlots('013f3939-0543-4c7d-b218-696037d30106', resourceId, date, slotDuration);
        return { slots };
    }
    async getResources(req, type) {
        return this.schedulingService.getResources(req.tenantId, type);
    }
    async createResource(req, data) {
        return this.schedulingService.createResource(req.tenantId, data);
    }
    async getBookings(req, type) {
        return this.schedulingService.getBookings(req.tenantId, type);
    }
    async bookResource(req, data) {
        return this.schedulingService.createCentralBooking(req.tenantId, data);
    }
    async cancelBooking(req, id) {
        return this.schedulingService.cancelBooking(req.tenantId, id);
    }
};
exports.SchedulingController = SchedulingController;
__decorate([
    (0, common_1.Get)('public/:slug/availability'),
    __param(0, (0, common_1.Query)('resourceId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('duration')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "getPublicAvailability", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Get)('resources'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "getResources", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Post)('resources'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "createResource", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "getBookings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Post)('book'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "bookResource", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Post)('bookings/:id/cancel'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SchedulingController.prototype, "cancelBooking", null);
exports.SchedulingController = SchedulingController = __decorate([
    (0, common_1.Controller)('scheduling'),
    __metadata("design:paramtypes", [scheduling_service_1.SchedulingService])
], SchedulingController);
//# sourceMappingURL=scheduling.controller.js.map