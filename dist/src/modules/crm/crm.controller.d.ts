import { CrmService } from './crm.service';
export declare class CrmController {
    private readonly crmService;
    constructor(crmService: CrmService);
    getGuests(req: any): Promise<any>;
    searchGuests(req: any, query: string): Promise<any>;
    createGuest(req: any, data: any): Promise<any>;
    getGuestById(req: any, id: string): Promise<any>;
    updateGuest(req: any, id: string, data: any): Promise<any>;
    deleteGuest(req: any, id: string): Promise<any>;
}
