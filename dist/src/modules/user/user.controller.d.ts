import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getAll(): Promise<any>;
    getByOrg(orgId: string): Promise<any>;
    createInOrg(orgId: string, data: any): Promise<any>;
    delete(id: string, orgId: string): Promise<any>;
}
