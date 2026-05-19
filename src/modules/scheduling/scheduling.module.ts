import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService, SchedulingEventsService } from './scheduling.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService, SchedulingEventsService],
  exports: [SchedulingService, SchedulingEventsService],
})
export class SchedulingModule {}
