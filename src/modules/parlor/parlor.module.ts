import { Module } from '@nestjs/common';
import { ParlorService } from './parlor.service';
import { ParlorController } from './parlor.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParlorController],
  providers: [ParlorService],
})
export class ParlorModule {}
