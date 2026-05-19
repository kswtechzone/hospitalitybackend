import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    getInvoices(req: any): Promise<any>;
    createInvoice(data: any, req: any): Promise<any>;
    generateBookingInvoice(bookingId: string, req: any): Promise<any>;
    getExpenses(req: any): Promise<any>;
    createExpense(data: any, req: any): Promise<any>;
}
