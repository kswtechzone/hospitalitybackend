import { RestaurantService } from './restaurant.service';
export declare class RestaurantController {
    private readonly restaurantService;
    constructor(restaurantService: RestaurantService);
    getAllRestaurants(): Promise<any>;
    getRestaurants(req: any): Promise<any>;
    createRestaurant(data: any, req: any): Promise<any>;
    getMenu(id: string, req: any): Promise<any>;
    createMenu(id: string, data: any, req: any): Promise<any>;
    createCategory(restaurantId: string, menuId: string, data: any, req: any): Promise<any>;
    createMenuItem(restaurantId: string, categoryId: string, data: any, req: any): Promise<any>;
    createOrder(id: string, data: any, req: any): Promise<any>;
}
