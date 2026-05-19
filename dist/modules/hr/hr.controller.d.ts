import { HrService } from './hr.service';
export declare class HrController {
    private readonly hrService;
    constructor(hrService: HrService);
    getStaff(req: any): Promise<any>;
    createStaff(data: any, req: any): Promise<any>;
    addAttendance(id: string, data: any, req: any): Promise<any>;
}
