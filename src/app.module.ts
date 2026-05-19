import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UserModule } from './modules/user/user.module';
import { WebsiteModule } from './modules/website/website.module';
import { CmsModule } from './modules/cms/cms.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TenantResolverMiddleware } from './middleware/tenant-resolver.middleware';
import { HrModule } from './modules/hr/hr.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ParlorModule } from './modules/parlor/parlor.module';
import { PublicModule } from './modules/public/public.module';
import { CrmModule } from './modules/crm/crm.module';
import { IdentityModule } from './modules/identity/identity.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HotelModule,
    OrganizationModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    WebsiteModule,
    CmsModule,
    RestaurantModule,
    InventoryModule,
    HrModule,
    FinanceModule,
    ParlorModule,
    PublicModule,
    CrmModule,
    IdentityModule,
    SchedulingModule,
    PromotionModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}


