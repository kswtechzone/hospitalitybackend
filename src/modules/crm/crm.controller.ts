import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('guests')
  getGuests(@Request() req) {
    return this.crmService.getGuests(req.tenantId);
  }

  @Get('guests/search')
  searchGuests(@Request() req, @Query('q') query: string) {
    return this.crmService.searchGuests(req.tenantId, query);
  }

  @Post('guests')
  createGuest(@Request() req, @Body() data: any) {
    return this.crmService.createGuest(req.tenantId, data);
  }

  @Get('guests/:id')
  getGuestById(@Request() req, @Param('id') id: string) {
    return this.crmService.getGuestById(req.tenantId, id);
  }

  @Patch('guests/:id')
  updateGuest(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.crmService.updateGuest(req.tenantId, id, data);
  }

  @Delete('guests/:id')
  deleteGuest(@Request() req, @Param('id') id: string) {
    return this.crmService.deleteGuest(req.tenantId, id);
  }
}
