import { PrismaService } from '../prisma/prisma.service';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    getInventoryItems(orgId: string): Promise<any>;
    createInventoryItem(orgId: string, data: any): Promise<any>;
    addStockTransaction(itemId: string, orgId: string, data: any): Promise<any>;
}
