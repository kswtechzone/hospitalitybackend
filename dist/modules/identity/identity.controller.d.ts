import { IdentityService } from './identity.service';
export declare class IdentityController {
    private identityService;
    constructor(identityService: IdentityService);
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
    getProfile(req: any): Promise<any>;
    createOrganization(data: any): Promise<any>;
    inviteUser(orgId: string, data: any): Promise<any>;
    linkCustomer(req: any, data: any): Promise<any>;
}
