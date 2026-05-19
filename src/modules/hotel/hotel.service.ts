import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../public/cache.service';

@Injectable()
export class HotelService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  // --- Hotel Management ---
  async createHotel(data: { 
    name: string; 
    address: string; 
    organizationId: string; 
    brandId: string 
  }) {
    return this.prisma.client.hotel.create({
      data,
    });
  }

  async getHotelsByOrganization(organizationId: string) {
    return this.prisma.client.hotel.findMany({
      where: { organizationId },
      include: { rooms: true },
    });
  }

  // --- Room Management ---
  async addRoom(data: {
    hotelId: string;
    roomNumber: string;
    type: string;
    dailyRate: number;
    capacity?: number;
    isHourlyAvailable?: boolean;
    rate3h?: number;
    rate6h?: number;
    rate9h?: number;
    rate12h?: number;
  }) {
    return this.prisma.client.room.create({
      data: {
        hotelId: data.hotelId,
        roomNumber: data.roomNumber,
        type: data.type,
        dailyRate: Number(data.dailyRate),
        capacity: data.capacity ? Number(data.capacity) : 2,
        isHourlyAvailable: Boolean(data.isHourlyAvailable),
        rate3h: data.rate3h ? Number(data.rate3h) : null,
        rate6h: data.rate6h ? Number(data.rate6h) : null,
        rate9h: data.rate9h ? Number(data.rate9h) : null,
        rate12h: data.rate12h ? Number(data.rate12h) : null,
      },
    });
  }

  async getHotelRooms(hotelId: string) {
    return this.prisma.client.room.findMany({
      where: { hotelId },
    });
  }

  // --- Booking Logic (The "Hourly Place" System) ---
  async createBooking(orgId: string, data: {
    roomId: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    startTime: string | Date;
    endTime: string | Date;
    notes?: string;
  }) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // 1. Verify Room belongs to Org
    const room = await this.prisma.client.room.findFirst({
      where: { 
        id: data.roomId,
        hotel: { organizationId: orgId }
      },
      include: { hotel: true }
    });

    if (!room) {
      throw new NotFoundException('Room not found or access denied');
    }

    // 2. Check Availability (Overlap Detection)
    const existingBooking = await this.prisma.client.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start },
          },
        ],
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Room is already booked for this time period');
    }

    // 3. Calculate Pricing Logic
    const durationInMs = end.getTime() - start.getTime();
    const durationInHours = durationInMs / (1000 * 60 * 60);
    
    let totalPrice = 0;

    // Logic: If duration is less than or equal to 12 hours and room has hourly blocks available
    if (durationInHours <= 12 && room.isHourlyAvailable) {
      if (durationInHours <= 3 && room.rate3h) {
        totalPrice = room.rate3h;
      } else if (durationInHours <= 6 && room.rate6h) {
        totalPrice = room.rate6h;
      } else if (durationInHours <= 9 && room.rate9h) {
        totalPrice = room.rate9h;
      } else if (room.rate12h) {
        totalPrice = room.rate12h;
      } else {
        totalPrice = room.dailyRate;
      }
    } else {
      const days = Math.ceil(durationInHours / 24);
      totalPrice = days * room.dailyRate;
    }

    // 4. Create Booking
    const booking = await this.prisma.client.booking.create({
      data: {
        organizationId: orgId,
        roomId: data.roomId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        startTime: start,
        endTime: end,
        totalPrice,
        notes: data.notes,
        status: 'CONFIRMED',
      },
    });

    // CQRS Cache Invalidation
    try {
      const org = await this.prisma.client.organization.findUnique({
        where: { id: orgId },
        select: { slug: true }
      });
      if (org) {
        this.cache.clearTenantCache(org.slug);
      }
    } catch (err) {
      console.error('Failed to invalidate hotel availability cache:', err);
    }

    return booking;
  }

  async getBookingsByRoom(roomId: string) {
    return this.prisma.client.booking.findMany({
      where: { roomId },
      orderBy: { startTime: 'asc' },
    });
  }

  async getRecentBookings(organizationId: string) {
    return this.prisma.client.booking.findMany({
      where: {
        room: {
          hotel: {
            organizationId
          }
        }
      },
      include: {
        room: {
          include: {
            hotel: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }
}
