import { OrganizationService } from './organization.service';
export declare class OrganizationController {
    private readonly orgService;
    constructor(orgService: OrganizationService);
    getAll(): Promise<any>;
    getLogs(): Promise<any>;
    getStats(): Promise<{
        orgCount: any;
        userCount: any;
        hotelCount: any;
        recentLogs: any;
    }>;
    getOne(id: string): Promise<any>;
    getBrands(id: string): Promise<any>;
    updateModules(id: string, modules: string[]): Promise<any>;
    toggleModule(id: string, moduleName: string): Promise<any>;
}
