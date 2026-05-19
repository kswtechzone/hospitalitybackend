import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ParlorService } from './parlor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/parlor')
export class ParlorController {
  constructor(private readonly parlorService: ParlorService) {}

  @Get('categories')
  getCategories(@Request() req) {
    return this.parlorService.getCategories(req.tenantId);
  }

  @Post('categories')
  createCategory(@Body('name') name: string, @Request() req) {
    return this.parlorService.createCategory(req.tenantId, name);
  }

  @Get('services')
  getServices(@Request() req) {
    return this.parlorService.getServices(req.tenantId);
  }

  @Post('services')
  createService(@Body() data: any, @Request() req) {
    return this.parlorService.createService(req.tenantId, data);
  }

  @Patch('services/:id')
  updateService(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.parlorService.updateService(req.tenantId, id, data);
  }

  @Get('bookings')
  getBookings(@Request() req) {
    return this.parlorService.getBookings(req.tenantId);
  }

  @Post('bookings')
  createBooking(@Body() data: any, @Request() req) {
    return this.parlorService.createBooking(req.tenantId, data);
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(
    @Param('id') id: string, 
    @Request() req,
    @Body('status') status: string, 
    @Body('paymentStatus') paymentStatus?: string,
    @Body('bookingTime') bookingTime?: string
  ) {
    return this.parlorService.updateBookingStatus(req.tenantId, id, status, paymentStatus, bookingTime);
  }
}
