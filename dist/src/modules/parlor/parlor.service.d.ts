import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../public/cache.service';
export declare class ParlorService {
    private prisma;
    private cache;
    constructor(prisma: PrismaService, cache: CacheService);
    getCategories(orgId: string): Promise<any>;
    createCategory(orgId: string, name: string): Promise<any>;
    getServices(orgId: string): Promise<any>;
    createService(orgId: string, data: any): Promise<any>;
    updateService(orgId: string, serviceId: string, data: any): Promise<any>;
    getBookings(orgId: string): Promise<any>;
    createBooking(orgId: string, data: any): Promise<any>;
    updateBookingStatus(orgId: string, bookingId: string, status: string, paymentStatus?: string, bookingTime?: string): Promise<any>;
}
