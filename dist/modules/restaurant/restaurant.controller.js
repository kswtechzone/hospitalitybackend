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
exports.RestaurantController = void 0;
const common_1 = require("@nestjs/common");
const restaurant_service_1 = require("./restaurant.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_guard_1 = require("../auth/tenant.guard");
let RestaurantController = class RestaurantController {
    constructor(restaurantService) {
        this.restaurantService = restaurantService;
    }
    getAllRestaurants() {
        return this.restaurantService.getAllRestaurants();
    }
    getRestaurants(req) {
        return this.restaurantService.getRestaurants(req.tenantId);
    }
    createRestaurant(data, req) {
        return this.restaurantService.createRestaurant(req.tenantId, data, req.user.role);
    }
    getMenu(id, req) {
        console.log(`[RestaurantController] GET menus for restaurant: ${id}, tenant: ${req.tenantId}`);
        return this.restaurantService.getMenu(id, req.tenantId);
    }
    createMenu(id, data, req) {
        return this.restaurantService.createMenu(id, req.tenantId, data);
    }
    createCategory(restaurantId, menuId, data, req) {
        return this.restaurantService.createCategory(menuId, req.tenantId, data);
    }
    createMenuItem(restaurantId, categoryId, data, req) {
        return this.restaurantService.createMenuItem(categoryId, req.tenantId, data);
    }
    createOrder(id, data, req) {
        return this.restaurantService.createOrder(id, req.tenantId, data);
    }
};
exports.RestaurantController = RestaurantController;
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "getAllRestaurants", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "getRestaurants", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createRestaurant", null);
__decorate([
    (0, common_1.Get)(':id/menus'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Post)(':id/menus'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createMenu", null);
__decorate([
    (0, common_1.Post)(':id/menus/:menuId/categories'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Post)(':id/categories/:categoryId/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('categoryId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createMenuItem", null);
__decorate([
    (0, common_1.Post)(':id/orders'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createOrder", null);
exports.RestaurantController = RestaurantController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Controller)('api/v1/restaurants'),
    __metadata("design:paramtypes", [restaurant_service_1.RestaurantService])
], RestaurantController);
//# sourceMappingURL=restaurant.controller.js.map