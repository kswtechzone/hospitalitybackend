import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(data: any): Promise<any>;
    login(email: string, pass: string): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            organization: any;
        };
    }>;
}
