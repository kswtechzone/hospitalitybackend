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
exports.WebsiteController = void 0;
const common_1 = require("@nestjs/common");
const website_service_1 = require("./website.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_guard_1 = require("../auth/tenant.guard");
let WebsiteController = class WebsiteController {
    constructor(websiteService) {
        this.websiteService = websiteService;
    }
    getOrgBrands(req) {
        return this.websiteService.getOrgBrands(req.tenantId);
    }
    getWebsites(req) {
        return this.websiteService.getWebsites(req.tenantId);
    }
    getWebsiteById(id, req) {
        return this.websiteService.getWebsiteById(id, req.tenantId);
    }
    createWebsite(data, req) {
        return this.websiteService.createWebsite(req.tenantId, data);
    }
    updateWebsite(id, data, req) {
        return this.websiteService.updateWebsite(id, req.tenantId, data);
    }
    deleteWebsite(id, req) {
        return this.websiteService.deleteWebsite(id, req.tenantId);
    }
    createPage(websiteId, data, req) {
        return this.websiteService.createPage(websiteId, req.tenantId, data);
    }
    updatePage(pageId, data, req) {
        return this.websiteService.updatePage(pageId, req.tenantId, data);
    }
    deletePage(pageId, req) {
        return this.websiteService.deletePage(pageId, req.tenantId);
    }
    createSection(pageId, data, req) {
        return this.websiteService.createSection(pageId, req.tenantId, data);
    }
    updateSection(sectionId, data, req) {
        return this.websiteService.updateSection(sectionId, req.tenantId, data);
    }
    deleteSection(sectionId, req) {
        return this.websiteService.deleteSection(sectionId, req.tenantId);
    }
};
exports.WebsiteController = WebsiteController;
__decorate([
    (0, common_1.Get)('brands'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "getOrgBrands", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "getWebsites", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "getWebsiteById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "createWebsite", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "updateWebsite", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "deleteWebsite", null);
__decorate([
    (0, common_1.Post)(':id/pages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "createPage", null);
__decorate([
    (0, common_1.Put)('pages/:pageId'),
    __param(0, (0, common_1.Param)('pageId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "updatePage", null);
__decorate([
    (0, common_1.Delete)('pages/:pageId'),
    __param(0, (0, common_1.Param)('pageId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "deletePage", null);
__decorate([
    (0, common_1.Post)('pages/:pageId/sections'),
    __param(0, (0, common_1.Param)('pageId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "createSection", null);
__decorate([
    (0, common_1.Put)('sections/:sectionId'),
    __param(0, (0, common_1.Param)('sectionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "updateSection", null);
__decorate([
    (0, common_1.Delete)('sections/:sectionId'),
    __param(0, (0, common_1.Param)('sectionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WebsiteController.prototype, "deleteSection", null);
exports.WebsiteController = WebsiteController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    (0, common_1.Controller)('api/v1/websites'),
    __metadata("design:paramtypes", [website_service_1.WebsiteService])
], WebsiteController);
//# sourceMappingURL=website.controller.js.map