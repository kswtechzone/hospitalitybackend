"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicModule = void 0;
const common_1 = require("@nestjs/common");
const public_controller_1 = require("./public.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const cache_service_1 = require("./cache.service");
let PublicModule = class PublicModule {
};
exports.PublicModule = PublicModule;
exports.PublicModule = PublicModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [public_controller_1.PublicModuleController],
        providers: [cache_service_1.CacheService],
        exports: [cache_service_1.CacheService],
    })
], PublicModule);
//# sourceMappingURL=public.module.js.map