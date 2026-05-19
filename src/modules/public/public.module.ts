import { Module, Global } from '@nestjs/common';
import { PublicModuleController } from './public.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [PublicModuleController],
  providers: [CacheService],
  exports: [CacheService],
})
export class PublicModule {}
