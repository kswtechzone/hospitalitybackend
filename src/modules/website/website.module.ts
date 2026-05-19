import { Module } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { WebsiteController } from './website.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WebsiteService],
  controllers: [WebsiteController],
  exports: [WebsiteService],
})
export class WebsiteModule {}
