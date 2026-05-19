"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const hotel_module_1 = require("./modules/hotel/hotel.module");
const organization_module_1 = require("./modules/organization/organization.module");
const user_module_1 = require("./modules/user/user.module");
const website_module_1 = require("./modules/website/website.module");
const cms_module_1 = require("./modules/cms/cms.module");
const restaurant_module_1 = require("./modules/restaurant/restaurant.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const tenant_resolver_middleware_1 = require("./middleware/tenant-resolver.middleware");
const hr_module_1 = require("./modules/hr/hr.module");
const finance_module_1 = require("./modules/finance/finance.module");
const parlor_module_1 = require("./modules/parlor/parlor.module");
const public_module_1 = require("./modules/public/public.module");
const crm_module_1 = require("./modules/crm/crm.module");
const identity_module_1 = require("./modules/identity/identity.module");
const scheduling_module_1 = require("./modules/scheduling/scheduling.module");
const promotion_module_1 = require("./modules/promotion/promotion.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(tenant_resolver_middleware_1.TenantResolverMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            hotel_module_1.HotelModule,
            organization_module_1.OrganizationModule,
            user_module_1.UserModule,
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || 'secret',
                signOptions: { expiresIn: '1d' },
            }),
            website_module_1.WebsiteModule,
            cms_module_1.CmsModule,
            restaurant_module_1.RestaurantModule,
            inventory_module_1.InventoryModule,
            hr_module_1.HrModule,
            finance_module_1.FinanceModule,
            parlor_module_1.ParlorModule,
            public_module_1.PublicModule,
            crm_module_1.CrmModule,
            identity_module_1.IdentityModule,
            scheduling_module_1.SchedulingModule,
            promotion_module_1.PromotionModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map