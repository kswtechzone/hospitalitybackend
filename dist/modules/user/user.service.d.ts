import { PrismaService } from '../prisma/prisma.service';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrganizationUser(orgId: string, data: any): Promise<any>;
    getOrganizationUsers(orgId: string): Promise<any>;
    getAllUsers(): Promise<any>;
    deleteUser(orgId: string, userId: string): Promise<any>;
}
