import { PrismaService } from '../prisma/prisma.service';
export declare class HrService {
    private prisma;
    constructor(prisma: PrismaService);
    getStaff(orgId: string): Promise<any>;
    createStaff(orgId: string, data: any): Promise<any>;
    addAttendance(staffId: string, orgId: string, data: any): Promise<any>;
}
