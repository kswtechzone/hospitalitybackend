import { PrismaService } from '../prisma/prisma.service';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getInvoices(orgId: string): Promise<any>;
    createInvoice(orgId: string, data: any): Promise<any>;
    generateBookingInvoice(orgId: string, bookingId: string): Promise<any>;
    getExpenses(orgId: string): Promise<any>;
    createExpense(orgId: string, data: any): Promise<any>;
}
