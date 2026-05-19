import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter } from 'events';

@Injectable()
export class SchedulingEventsService extends EventEmitter {}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

@Injectable()
export class SchedulingService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: SchedulingEventsService,
  ) {}

  /**
   * Registers a new physical or staff resource.
   */
  async createResource(orgId: string, data: any) {
    const { name, type, capacity } = data;
    if (!name || !type) {
      throw new BadRequestException('Resource name and type are required');
    }

    return this.prisma.client.schedulableResource.create({
      data: {
        organizationId: orgId,
        name,
        type,
        capacity: capacity || 1,
        isActive: true,
      },
    });
  }

  /**
   * Retrieves active schedulable resources for an organization.
   */
  async getResources(orgId: string, type?: string) {
    return this.prisma.client.schedulableResource.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
        ...(type ? { type } : {}),
      },
    });
  }

  /**
   * Dynamically calculates timezone-safe available slots for a target resource.
   */
  async calculateAvailableSlots(
    orgId: string,
    resourceId: string,
    date: string, // YYYY-MM-DD
    slotDurationMinutes: number
  ): Promise<TimeSlot[]> {
    const resource = await this.prisma.client.schedulableResource.findFirst({
      where: { id: resourceId, organizationId: orgId, isActive: true },
    });

    if (!resource) {
      throw new NotFoundException('Target schedulable resource not found');
    }

    // Resolve date limits (08:00 AM to 08:00 PM for the target slot calculation)
    const startTimeUtc = new Date(`${date}T08:00:00.000Z`);
    const endTimeUtc = new Date(`${date}T20:00:00.000Z`);

    // Fetch overlapping bookings
    const bookings = await this.prisma.client.centralBooking.findMany({
      where: {
        organizationId: orgId,
        status: { in: ['PENDING', 'RESERVED', 'CONFIRMED', 'IN_PROGRESS'] },
        resources: {
          some: { resourceId },
        },
        startTime: { lt: endTimeUtc },
        endTime: { gt: startTimeUtc },
      },
      select: { startTime: true, endTime: true },
    });

    const slots: TimeSlot[] = [];
    let current = startTimeUtc;

    while (current.getTime() < endTimeUtc.getTime()) {
      const next = new Date(current.getTime() + slotDurationMinutes * 60000);
      if (next.getTime() > endTimeUtc.getTime()) break;

      // Overlap calculation
      const isTaken = bookings.some((b) => {
        const bStart = b.startTime.getTime();
        const bEnd = b.endTime.getTime();
        const curStart = current.getTime();
        const curEnd = next.getTime();
        return curStart < bEnd && curEnd > bStart;
      });

      slots.push({
        start: current,
        end: next,
        available: !isTaken,
      });

      current = next;
    }

    return slots;
  }

  /**
   * Concurrency-Safe Central Booking Creator.
   * Locks target SchedulableResource rows during transaction bounds.
   */
  async createCentralBooking(orgId: string, data: any) {
    const { customerId, startTime, endTime, type, resourceIds, hotelDetails, salonDetails, restaurantDetails } = data;

    if (!customerId || !startTime || !endTime || !type || !resourceIds || resourceIds.length === 0) {
      throw new BadRequestException('Required fields: customerId, startTime, endTime, type, resourceIds');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start.getTime() >= end.getTime()) {
      throw new BadRequestException('startTime must occur before endTime');
    }

    return this.prisma.client.$transaction(async (tx) => {
      // 1. SELECT FOR UPDATE to prevent race conditions on resources
      for (const resId of resourceIds) {
        const locked: any[] = await tx.$queryRawUnsafe(`
          SELECT id FROM "SchedulableResource" 
          WHERE id = $1 AND "organizationId" = $2 AND "isActive" = TRUE 
          FOR UPDATE
        `, resId, orgId);

        if (!locked || locked.length === 0) {
          throw new ConflictException(`Resource ID ${resId} is unavailable, inactive, or locked by another transaction`);
        }
      }

      // 2. Perform isolation overlap check within transaction scope
      const overlap = await tx.centralBooking.findFirst({
        where: {
          organizationId: orgId,
          status: { in: ['PENDING', 'RESERVED', 'CONFIRMED', 'IN_PROGRESS'] },
          resources: {
            some: {
              resourceId: { in: resourceIds },
            },
          },
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (overlap) {
        throw new ConflictException('Double booking detected: One of the selected resources is already reserved during this period');
      }

      // 3. Create core CentralBooking
      const booking = await tx.centralBooking.create({
        data: {
          organizationId: orgId,
          customerId,
          type,
          startTime: start,
          endTime: end,
          status: 'PENDING',
        },
      });

      // 4. Map resource links
      await tx.bookingResourceLink.createMany({
        data: resourceIds.map((resId) => ({
          bookingId: booking.id,
          resourceId: resId,
        })),
      });

      // 5. Append domain extensions
      let details: any = null;
      if (type === 'HOTEL' && hotelDetails) {
        details = await tx.hotelBookingDetails.create({
          data: {
            bookingId: booking.id,
            roomId: hotelDetails.roomId,
            guestCount: hotelDetails.guestCount || 1,
            nightCount: hotelDetails.nightCount || 1,
          },
        });
      } else if (type === 'SALON' && salonDetails) {
        details = await tx.salonBookingDetails.create({
          data: {
            bookingId: booking.id,
            staffId: salonDetails.staffId,
            serviceIds: salonDetails.serviceIds || [],
            durationMinutes: salonDetails.durationMinutes || 60,
          },
        });
      } else if (type === 'RESTAURANT' && restaurantDetails) {
        details = await tx.restaurantReservationDetails.create({
          data: {
            bookingId: booking.id,
            tableId: restaurantDetails.tableId,
            guestCount: restaurantDetails.guestCount || 1,
          },
        });
      }

      // 6. Broadcast to event emitter out-of-band
      this.eventEmitter.emit(`booking.created.${type.toLowerCase()}`, {
        bookingId: booking.id,
        orgId,
        customerId,
        startTime: start,
        endTime: end,
        details,
      });

      return { booking, details };
    });
  }

  /**
   * Safe booking cancellation worker.
   */
  async cancelBooking(orgId: string, bookingId: string) {
    const booking = await this.prisma.client.centralBooking.findFirst({
      where: { id: bookingId, organizationId: orgId },
    });

    if (!booking) {
      throw new NotFoundException('Central booking record not found');
    }

    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)) {
      throw new BadRequestException(`Cannot alter booking status from a finalized ${booking.status} state`);
    }

    const updated = await this.prisma.client.centralBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    this.eventEmitter.emit(`booking.cancelled.${booking.type.toLowerCase()}`, {
      bookingId,
      orgId,
      updated,
    });

    return updated;
  }

  /**
   * Retrieves active bookings with scoped organization filter.
   */
  async getBookings(orgId: string, type?: string) {
    return this.prisma.client.centralBooking.findMany({
      where: {
        organizationId: orgId,
        ...(type ? { type } : {}),
      },
      include: {
        resources: {
          include: {
            resource: true,
          },
        },
        hotelDetails: true,
        salonDetails: true,
        restaurantDetails: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }
}
