import { PrismaService } from '../prisma/prisma.service';
export declare class OrganizationService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllOrganizations(): Promise<any>;
    getOrganizationById(id: string): Promise<any>;
    updateModules(orgId: string, modules: string[]): Promise<any>;
    toggleModule(orgId: string, moduleName: string): Promise<any>;
    getActivityLogs(): Promise<any>;
    getDashboardStats(): Promise<{
        orgCount: any;
        userCount: any;
        hotelCount: any;
        recentLogs: any;
    }>;
    getBrands(orgId: string): Promise<any>;
    updateOrganizationProfile(id: string, data: {
        country?: string;
        currency?: string;
        name?: string;
    }): Promise<any>;
}
