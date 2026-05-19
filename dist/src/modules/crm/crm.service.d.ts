import { PrismaService } from '../prisma/prisma.service';
export declare class CrmService {
    private prisma;
    constructor(prisma: PrismaService);
    getGuests(orgId: string): Promise<any>;
    getGuestById(orgId: string, id: string): Promise<any>;
    searchGuests(orgId: string, query: string): Promise<any>;
    createGuest(orgId: string, data: any): Promise<any>;
    updateGuest(orgId: string, id: string, data: any): Promise<any>;
    deleteGuest(orgId: string, id: string): Promise<any>;
}
