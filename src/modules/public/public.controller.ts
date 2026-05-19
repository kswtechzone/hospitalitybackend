import { Controller, Get, Post, Body, Param, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from './cache.service';

@Controller('api/v1/public/:slug')
export class PublicModuleController {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  private async getOrg(slug: string) {
    let org = await this.prisma.client.organization.findUnique({
      where: { slug },
      select: { id: true, enabledModules: true, name: true }
    });

    if (!org) {
      const website = await this.prisma.client.website.findUnique({
        where: { subdomain: slug },
        select: {
          organization: {
            select: { id: true, enabledModules: true, name: true }
          }
        }
      });
      if (website) {
        org = website.organization;
      }
    }

    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  // --- GENERAL INFO ---
  @Get()
  async getPublicOrgInfo(@Param('slug') slug: string) {
    const cacheKey = `org_info:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Cache Hit: Org Info for slug "${slug}"`);
      return cached;
    }

    const org = await this.prisma.client.organization.findUnique({
      where: { slug },
      select: { 
        name: true, 
        slug: true, 
        enabledModules: true,
        brands: {
          select: { name: true, slug: true, domain: true, themeColors: true }
        }
      }
    });
    if (!org) throw new NotFoundException('Organization not found');

    this.cache.set(cacheKey, org, 300); // Cache for 5 mins
    return org;
  }

  @Get('website')
  async getPublicWebsite(@Param('slug') slug: string) {
    const cacheKey = `public_website:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Cache Hit: Public Website for slug "${slug}"`);
      return cached;
    }

    const website = await this.prisma.client.website.findFirst({
      where: {
        OR: [
          { subdomain: slug },
          { organization: { slug } }
        ],
        deletedAt: null
      },
      include: {
        brand: true,
        pages: {
          include: {
            sections: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!website) throw new NotFoundException('Website not found');

    this.cache.set(cacheKey, website, 60); // Cache for 60s
    return website;
  }

  private checkModule(org: any, moduleName: string) {
    if (!org.enabledModules.includes(moduleName)) {
      throw new ForbiddenException(`${moduleName} is not enabled for this organization`);
    }
  }

  // --- PUBLIC DATA ---

  @Get('hotel/rooms')
  async getPublicRooms(@Param('slug') slug: string) {
    const cacheKey = `hotel_rooms:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Cache Hit: Public Rooms list for slug "${slug}"`);
      return cached;
    }

    const org = await this.getOrg(slug);
    this.checkModule(org, 'HOTEL_MANAGEMENT');
    
    const rooms = await this.prisma.client.room.findMany({
      where: { hotel: { organizationId: org.id }, status: 'AVAILABLE' },
      include: { hotel: true }
    });

    this.cache.set(cacheKey, rooms, 30); // Cache for 30 seconds
    return rooms;
  }

  @Get('hotel/availability')
  async getRoomInventory(@Param('slug') slug: string) {
    const cacheKey = `hotel_availability:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Cache Hit: Availability count for slug "${slug}"`);
      return cached;
    }

    const org = await this.getOrg(slug);
    this.checkModule(org, 'HOTEL_MANAGEMENT');

    const availableRooms = await this.prisma.client.room.count({
      where: { hotel: { organizationId: org.id }, status: 'AVAILABLE' }
    });
    
    const result = { availableRooms, status: availableRooms > 0 ? 'AVAILABLE' : 'SOLD_OUT' };
    this.cache.set(cacheKey, result, 15); // Cache for 15 seconds
    return result;
  }

  @Get('restaurant/menu')
  async getPublicMenu(@Param('slug') slug: string) {
    const cacheKey = `restaurant_menu:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Cache Hit: Restaurant Menu for slug "${slug}"`);
      return cached;
    }

    const org = await this.getOrg(slug);
    this.checkModule(org, 'RESTAURANT');

    const menu = await this.prisma.client.menu.findMany({
      where: { restaurant: { organizationId: org.id }, isActive: true },
      include: { 
        categories: { 
          include: { items: { where: { isAvailable: true } } } 
        } 
      }
    });

    this.cache.set(cacheKey, menu, 300); // Cache for 5 minutes
    return menu;
  }

  @Get('parlor/services')
  async getPublicParlorServices(@Param('slug') slug: string) {
    const cacheKey = `parlor_services:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Cache Hit: Parlor Services for slug "${slug}"`);
      return cached;
    }

    const org = await this.getOrg(slug);
    this.checkModule(org, 'PARLOR');

    const services = await this.prisma.client.parlorService.findMany({
      where: { organizationId: org.id, isActive: true },
      include: { category: true }
    });

    this.cache.set(cacheKey, services, 300); // Cache for 5 minutes
    return services;
  }

  // --- PUBLIC BOOKINGS (WRITE Concern - Triggers Event Invalidation) ---

  @Post('hotel/book')
  async publicHotelBooking(@Param('slug') slug: string, @Body() data: any) {
    const org = await this.getOrg(slug);
    this.checkModule(org, 'HOTEL_MANAGEMENT');
    
    const room = await this.prisma.client.room.findFirst({
      where: { id: data.roomId, status: 'AVAILABLE' }
    });
    if (!room) throw new NotFoundException('Room not available');

    const booking = await this.prisma.client.booking.create({
      data: {
        organizationId: org.id,
        roomId: room.id,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        startTime: new Date(data.checkIn),
        endTime: new Date(data.checkOut),
        totalPrice: data.totalPrice,
        status: 'PENDING'
      }
    });

    // Invalidate local cache for availability and rooms immediately
    this.cache.clearTenantCache(slug);

    return booking;
  }

  @Post('restaurant/book')
  async publicRestaurantBooking(@Param('slug') slug: string, @Body() data: any) {
    const org = await this.getOrg(slug);
    this.checkModule(org, 'RESTAURANT');
    
    // Invalidate restaurant booking cache if table counts change
    this.cache.clearTenantCache(slug);
    
    return { message: 'Table reservation received', data };
  }

  @Post('parlor/book')
  async publicParlorBooking(@Param('slug') slug: string, @Body() data: any) {
    const org = await this.getOrg(slug);
    this.checkModule(org, 'PARLOR');
    
    const services = await this.prisma.client.parlorService.findMany({
      where: { id: { in: data.serviceIds }, organizationId: org.id }
    });

    if (services.length === 0) throw new NotFoundException('No valid services found');
    const totalPrice = services.reduce((s, x) => s + x.price, 0);

    const paymentMethod = data.paymentMethod || 'PAY_ON_VISIT';
    const paymentStatus = paymentMethod === 'PAY_NOW' ? 'PAID' : 'UNPAID';
    const bookingStatus = paymentMethod === 'PAY_NOW' ? 'CONFIRMED' : 'PENDING';

    const parlorBooking = await this.prisma.client.serviceBooking.create({
      data: {
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail,
        bookingTime: new Date(data.bookingTime),
        totalPrice,
        status: bookingStatus,
        paymentMethod,
        paymentStatus,
        organizationId: org.id,
        services: {
          create: services.map(s => ({
            serviceId: s.id,
            priceAtBooking: s.price
          }))
        }
      }
    });

    // Auto-create Guest KSW Profile if not exists
    try {
      const orConditions = [];
      if (data.guestPhone) orConditions.push({ phone: data.guestPhone });
      if (data.guestEmail) orConditions.push({ email: data.guestEmail });

      const existing = orConditions.length > 0
        ? await this.prisma.client.guestProfile.findFirst({
            where: {
              organizationId: org.id,
              OR: orConditions,
            },
          })
        : null;

      if (!existing) {
        await this.prisma.client.guestProfile.create({
          data: {
            organizationId: org.id,
            name: data.guestName,
            phone: data.guestPhone || null,
            email: data.guestEmail || null,
            isKswProfile: true, // Unified customer KSW login profile representation
            preferences: data.notes ? { note: data.notes } : {},
          },
        });
      }
    } catch (err) {
      console.error('Failed to auto-create client guest profile from public site booking:', err);
    }

    // Invalidate parlor cache
    this.cache.clearTenantCache(slug);

    return parlorBooking;
  }
}
