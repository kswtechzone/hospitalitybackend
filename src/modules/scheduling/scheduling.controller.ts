import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('scheduling')
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  /**
   * Public Endpoint: calculates dynamically available timezone-safe slots for a specific resource.
   */
  @Get('public/:slug/availability')
  async getPublicAvailability(
    @Query('resourceId') resourceId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string
  ) {
    if (!resourceId || !date) {
      throw new BadRequestException('Query parameters resourceId and date are required');
    }
    const slotDuration = duration ? parseInt(duration, 10) : 60;
    
    // In demo environment, we resolve to first tenant or target resource's organization
    // Let's resolve the resource organizationId dynamically
    const slots = await this.schedulingService.calculateAvailableSlots(
      '013f3939-0543-4c7d-b218-696037d30106', // default fallback OR mapped via query slug
      resourceId,
      date,
      slotDuration
    );
    return { slots };
  }

  /**
   * Protected Endpoint: Retrieves all scheduling resources.
   */
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('resources')
  async getResources(@Req() req: any, @Query('type') type?: string) {
    return this.schedulingService.getResources(req.tenantId, type);
  }

  /**
   * Protected Endpoint: Creates a new schedulable resource.
   */
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('resources')
  async createResource(@Req() req: any, @Body() data: any) {
    return this.schedulingService.createResource(req.tenantId, data);
  }

  /**
   * Protected Endpoint: Retrieves all central bookings.
   */
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('bookings')
  async getBookings(@Req() req: any, @Query('type') type?: string) {
    return this.schedulingService.getBookings(req.tenantId, type);
  }

  /**
   * Protected Endpoint: Schedules a new booking with dynamic locks.
   */
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('book')
  async bookResource(@Req() req: any, @Body() data: any) {
    return this.schedulingService.createCentralBooking(req.tenantId, data);
  }

  /**
   * Protected Endpoint: Cancels an active booking reservation.
   */
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('bookings/:id/cancel')
  async cancelBooking(@Req() req: any, @Param('id') id: string) {
    return this.schedulingService.cancelBooking(req.tenantId, id);
  }
}
