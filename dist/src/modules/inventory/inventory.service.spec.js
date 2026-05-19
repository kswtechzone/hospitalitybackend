"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const inventory_service_1 = require("./inventory.service");
describe('InventoryService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [inventory_service_1.InventoryService],
        }).compile();
        service = module.get(inventory_service_1.InventoryService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=inventory.service.spec.js.map