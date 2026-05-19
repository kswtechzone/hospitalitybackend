import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  async createHotel(@Body() data: any, @Request() req) {
    return this.hotelService.createHotel({ ...data, organizationId: req.tenantId });
  }

  @Get()
  async getHotels(@Request() req) {
    return this.hotelService.getHotelsByOrganization(req.tenantId);
  }

  @Post('room')
  async addRoom(@Body() data: any, @Request() req) {
    // Note: service should verify hotel ownership
    return this.hotelService.addRoom(data);
  }

  @Get(':id/rooms')
  async getRooms(@Param('id') hotelId: string) {
    return this.hotelService.getHotelRooms(hotelId);
  }

  @Post('booking')
  async createBooking(@Body() data: any, @Request() req) {
    return this.hotelService.createBooking(req.tenantId, data);
  }

  @Get('room/:roomId/bookings')
  async getRoomBookings(@Param('roomId') roomId: string) {
    return this.hotelService.getBookingsByRoom(roomId);
  }

  @Get('recent')
  async getRecentBookings(@Request() req) {
    return this.hotelService.getRecentBookings(req.tenantId);
  }
}
