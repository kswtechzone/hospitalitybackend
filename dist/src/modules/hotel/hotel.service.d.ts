import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../public/cache.service';
export declare class HotelService {
    private prisma;
    private cache;
    constructor(prisma: PrismaService, cache: CacheService);
    createHotel(data: {
        name: string;
        address: string;
        organizationId: string;
        brandId: string;
    }): Promise<any>;
    getHotelsByOrganization(organizationId: string): Promise<any>;
    addRoom(data: {
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
    }): Promise<any>;
    getHotelRooms(hotelId: string): Promise<any>;
    createBooking(orgId: string, data: {
        roomId: string;
        guestName: string;
        guestEmail: string;
        guestPhone?: string;
        startTime: string | Date;
        endTime: string | Date;
        notes?: string;
    }): Promise<any>;
    getBookingsByRoom(roomId: string): Promise<any>;
    getRecentBookings(organizationId: string): Promise<any>;
}
