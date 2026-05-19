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
exports.HotelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cache_service_1 = require("../public/cache.service");
let HotelService = class HotelService {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    async createHotel(data) {
        return this.prisma.client.hotel.create({
            data,
        });
    }
    async getHotelsByOrganization(organizationId) {
        return this.prisma.client.hotel.findMany({
            where: { organizationId },
            include: { rooms: true },
        });
    }
    async addRoom(data) {
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
    async getHotelRooms(hotelId) {
        return this.prisma.client.room.findMany({
            where: { hotelId },
        });
    }
    async createBooking(orgId, data) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        if (end <= start) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
        const room = await this.prisma.client.room.findFirst({
            where: {
                id: data.roomId,
                hotel: { organizationId: orgId }
            },
            include: { hotel: true }
        });
        if (!room) {
            throw new common_1.NotFoundException('Room not found or access denied');
        }
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
            throw new common_1.BadRequestException('Room is already booked for this time period');
        }
        const durationInMs = end.getTime() - start.getTime();
        const durationInHours = durationInMs / (1000 * 60 * 60);
        let totalPrice = 0;
        if (durationInHours <= 12 && room.isHourlyAvailable) {
            if (durationInHours <= 3 && room.rate3h) {
                totalPrice = room.rate3h;
            }
            else if (durationInHours <= 6 && room.rate6h) {
                totalPrice = room.rate6h;
            }
            else if (durationInHours <= 9 && room.rate9h) {
                totalPrice = room.rate9h;
            }
            else if (room.rate12h) {
                totalPrice = room.rate12h;
            }
            else {
                totalPrice = room.dailyRate;
            }
        }
        else {
            const days = Math.ceil(durationInHours / 24);
            totalPrice = days * room.dailyRate;
        }
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
        try {
            const org = await this.prisma.client.organization.findUnique({
                where: { id: orgId },
                select: { slug: true }
            });
            if (org) {
                this.cache.clearTenantCache(org.slug);
            }
        }
        catch (err) {
            console.error('Failed to invalidate hotel availability cache:', err);
        }
        return booking;
    }
    async getBookingsByRoom(roomId) {
        return this.prisma.client.booking.findMany({
            where: { roomId },
            orderBy: { startTime: 'asc' },
        });
    }
    async getRecentBookings(organizationId) {
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
};
exports.HotelService = HotelService;
exports.HotelService = HotelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService])
], HotelService);
//# sourceMappingURL=hotel.service.js.map