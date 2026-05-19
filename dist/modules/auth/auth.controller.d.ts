import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: any): Promise<any>;
    login(body: any): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            organization: any;
        };
    }>;
    getLoyalty(email: string): Promise<any>;
}
