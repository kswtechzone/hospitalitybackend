import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getInventoryItems(req: any): Promise<any>;
    createInventoryItem(data: any, req: any): Promise<any>;
    addStockTransaction(id: string, data: any, req: any): Promise<any>;
}
