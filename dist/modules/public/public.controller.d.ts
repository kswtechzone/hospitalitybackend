import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from './cache.service';
export declare class PublicModuleController {
    private prisma;
    private cache;
    constructor(prisma: PrismaService, cache: CacheService);
    private getOrg;
    getPublicOrgInfo(slug: string): Promise<any>;
    getPublicWebsite(slug: string): Promise<any>;
    private checkModule;
    getPublicRooms(slug: string): Promise<any>;
    getRoomInventory(slug: string): Promise<any>;
    getPublicMenu(slug: string): Promise<any>;
    getPublicParlorServices(slug: string): Promise<any>;
    publicHotelBooking(slug: string, data: any): Promise<any>;
    publicRestaurantBooking(slug: string, data: any): Promise<{
        message: string;
        data: any;
    }>;
    publicParlorBooking(slug: string, data: any): Promise<any>;
}
