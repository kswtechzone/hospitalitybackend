import { SchedulingService } from './scheduling.service';
export declare class SchedulingController {
    private schedulingService;
    constructor(schedulingService: SchedulingService);
    getPublicAvailability(resourceId: string, date: string, duration?: string): Promise<{
        slots: import("./scheduling.service").TimeSlot[];
    }>;
    getResources(req: any, type?: string): Promise<any>;
    createResource(req: any, data: any): Promise<any>;
    getBookings(req: any, type?: string): Promise<any>;
    bookResource(req: any, data: any): Promise<any>;
    cancelBooking(req: any, id: string): Promise<any>;
}
