import { ParlorService } from './parlor.service';
export declare class ParlorController {
    private readonly parlorService;
    constructor(parlorService: ParlorService);
    getCategories(req: any): Promise<any>;
    createCategory(name: string, req: any): Promise<any>;
    getServices(req: any): Promise<any>;
    createService(data: any, req: any): Promise<any>;
    updateService(id: string, data: any, req: any): Promise<any>;
    getBookings(req: any): Promise<any>;
    createBooking(data: any, req: any): Promise<any>;
    updateBookingStatus(id: string, req: any, status: string, paymentStatus?: string, bookingTime?: string): Promise<any>;
}
