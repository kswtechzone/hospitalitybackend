import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter } from 'events';
export declare class SchedulingEventsService extends EventEmitter {
}
export interface TimeSlot {
    start: Date;
    end: Date;
    available: boolean;
}
export declare class SchedulingService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: SchedulingEventsService);
    createResource(orgId: string, data: any): Promise<any>;
    getResources(orgId: string, type?: string): Promise<any>;
    calculateAvailableSlots(orgId: string, resourceId: string, date: string, slotDurationMinutes: number): Promise<TimeSlot[]>;
    createCentralBooking(orgId: string, data: any): Promise<any>;
    cancelBooking(orgId: string, bookingId: string): Promise<any>;
    getBookings(orgId: string, type?: string): Promise<any>;
}
