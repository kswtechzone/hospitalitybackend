import { PrismaService } from '../prisma/prisma.service';
export declare class RestaurantService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllRestaurants(): Promise<any>;
    getRestaurants(orgId: string): Promise<any>;
    createRestaurant(orgId: string, data: any, role?: string): Promise<any>;
    getMenu(restaurantId: string, orgId: string): Promise<any>;
    createMenu(restaurantId: string, orgId: string, data: {
        name: string;
    }): Promise<any>;
    createCategory(menuId: string, orgId: string, data: {
        name: string;
    }): Promise<any>;
    createMenuItem(categoryId: string, orgId: string, data: {
        name: string;
        price: number;
        description?: string;
    }): Promise<any>;
    createOrder(restaurantId: string, orgId: string, data: any): Promise<any>;
    private verifyRestaurantOwnership;
}
