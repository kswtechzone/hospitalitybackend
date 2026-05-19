import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class IdentityService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(data: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            phone: any;
            activeMembership: {
                organizationId: string;
                role: string;
            };
        };
    }>;
    login(data: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            phone: any;
            activeMembership: {
                organizationId: string;
                role: string;
            };
        };
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            phone: any;
            activeMembership: {
                organizationId: string;
                role: string;
            };
        };
    }>;
    getProfile(userId: string): Promise<any>;
    private generateAuthTokens;
    createOrganization(data: any): Promise<any>;
    inviteUserToOrganization(orgId: string, inviteData: any): Promise<any>;
    linkCustomerToOrganization(orgId: string, customerData: any): Promise<any>;
}
