"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const inventory_controller_1 = require("./inventory.controller");
describe('InventoryController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [inventory_controller_1.InventoryController],
        }).compile();
        controller = module.get(inventory_controller_1.InventoryController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=inventory.controller.spec.js.map