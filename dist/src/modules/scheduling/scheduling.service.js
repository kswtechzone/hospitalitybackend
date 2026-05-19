"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingService = exports.SchedulingEventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_1 = require("events");
let SchedulingEventsService = class SchedulingEventsService extends events_1.EventEmitter {
};
exports.SchedulingEventsService = SchedulingEventsService;
exports.SchedulingEventsService = SchedulingEventsService = __decorate([
    (0, common_1.Injectable)()
], SchedulingEventsService);
let SchedulingService = class SchedulingService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async createResource(orgId, data) {
        const { name, type, capacity } = data;
        if (!name || !type) {
            throw new common_1.BadRequestException('Resource name and type are required');
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
    async getResources(orgId, type) {
        return this.prisma.client.schedulableResource.findMany({
            where: {
                organizationId: orgId,
                isActive: true,
                ...(type ? { type } : {}),
            },
        });
    }
    async calculateAvailableSlots(orgId, resourceId, date, slotDurationMinutes) {
        const resource = await this.prisma.client.schedulableResource.findFirst({
            where: { id: resourceId, organizationId: orgId, isActive: true },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Target schedulable resource not found');
        }
        const startTimeUtc = new Date(`${date}T08:00:00.000Z`);
        const endTimeUtc = new Date(`${date}T20:00:00.000Z`);
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
        const slots = [];
        let current = startTimeUtc;
        while (current.getTime() < endTimeUtc.getTime()) {
            const next = new Date(current.getTime() + slotDurationMinutes * 60000);
            if (next.getTime() > endTimeUtc.getTime())
                break;
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
    async createCentralBooking(orgId, data) {
        const { customerId, startTime, endTime, type, resourceIds, hotelDetails, salonDetails, restaurantDetails } = data;
        if (!customerId || !startTime || !endTime || !type || !resourceIds || resourceIds.length === 0) {
            throw new common_1.BadRequestException('Required fields: customerId, startTime, endTime, type, resourceIds');
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (start.getTime() >= end.getTime()) {
            throw new common_1.BadRequestException('startTime must occur before endTime');
        }
        return this.prisma.client.$transaction(async (tx) => {
            for (const resId of resourceIds) {
                const locked = await tx.$queryRawUnsafe(`
          SELECT id FROM "SchedulableResource" 
          WHERE id = $1 AND "organizationId" = $2 AND "isActive" = TRUE 
          FOR UPDATE
        `, resId, orgId);
                if (!locked || locked.length === 0) {
                    throw new common_1.ConflictException(`Resource ID ${resId} is unavailable, inactive, or locked by another transaction`);
                }
            }
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
                throw new common_1.ConflictException('Double booking detected: One of the selected resources is already reserved during this period');
            }
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
            await tx.bookingResourceLink.createMany({
                data: resourceIds.map((resId) => ({
                    bookingId: booking.id,
                    resourceId: resId,
                })),
            });
            let details = null;
            if (type === 'HOTEL' && hotelDetails) {
                details = await tx.hotelBookingDetails.create({
                    data: {
                        bookingId: booking.id,
                        roomId: hotelDetails.roomId,
                        guestCount: hotelDetails.guestCount || 1,
                        nightCount: hotelDetails.nightCount || 1,
                    },
                });
            }
            else if (type === 'SALON' && salonDetails) {
                details = await tx.salonBookingDetails.create({
                    data: {
                        bookingId: booking.id,
                        staffId: salonDetails.staffId,
                        serviceIds: salonDetails.serviceIds || [],
                        durationMinutes: salonDetails.durationMinutes || 60,
                    },
                });
            }
            else if (type === 'RESTAURANT' && restaurantDetails) {
                details = await tx.restaurantReservationDetails.create({
                    data: {
                        bookingId: booking.id,
                        tableId: restaurantDetails.tableId,
                        guestCount: restaurantDetails.guestCount || 1,
                    },
                });
            }
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
    async cancelBooking(orgId, bookingId) {
        const booking = await this.prisma.client.centralBooking.findFirst({
            where: { id: bookingId, organizationId: orgId },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Central booking record not found');
        }
        if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)) {
            throw new common_1.BadRequestException(`Cannot alter booking status from a finalized ${booking.status} state`);
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
    async getBookings(orgId, type) {
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
};
exports.SchedulingService = SchedulingService;
exports.SchedulingService = SchedulingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        SchedulingEventsService])
], SchedulingService);
//# sourceMappingURL=scheduling.service.js.map