import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('staff')
  getStaff(@Request() req) {
    return this.hrService.getStaff(req.tenantId);
  }

  @Post('staff')
  createStaff(@Body() data: any, @Request() req) {
    return this.hrService.createStaff(req.tenantId, data);
  }

  @Post('staff/:id/attendance')
  addAttendance(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.hrService.addAttendance(id, req.tenantId, data);
  }
}
