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
exports.HotelController = void 0;
const common_1 = require("@nestjs/common");
const hotel_service_1 = require("./hotel.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_guard_1 = require("../auth/tenant.guard");
let HotelController = class HotelController {
    constructor(hotelService) {
        this.hotelService = hotelService;
    }
    async createHotel(data, req) {
        return this.hotelService.createHotel({ ...data, organizationId: req.tenantId });
    }
    async getHotels(req) {
        return this.hotelService.getHotelsByOrganization(req.tenantId);
    }
    async addRoom(data, req) {
        return this.hotelService.addRoom(data);
    }
    async getRooms(hotelId) {
        return this.hotelService.getHotelRooms(hotelId);
    }
    async createBooking(data, req) {
        return this.hotelService.createBooking(req.tenantId, data);
    }
    async getRoomBookings(roomId) {
        return this.hotelService.getBookingsByRoom(roomId);
    }
    async getRecentBookings(req) {
        return this.hotelService.getRecentBookings(req.tenantId);
    }
};
exports.HotelController = HotelController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HotelController.prototype, "createHotel", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HotelController.prototype, "getHotels", null);
__decorate([
    (0, common_1.Post)('room'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HotelController.prototype, "addRoom", null);
__decorate([
    (0, common_1.Get)(':id/rooms'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HotelController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Post)('booking'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HotelController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)('room/:roomId/bookings'),
    __param(0, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HotelController.prototype, "getRoomBookings", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HotelController.prototype, "getRecentBookings", null);
exports.HotelController = HotelController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Controller)('api/v1/hotel'),
    __metadata("design:paramtypes", [hotel_service_1.HotelService])
], HotelController);
//# sourceMappingURL=hotel.controller.js.map