"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const restaurant_controller_1 = require("./restaurant.controller");
describe('RestaurantController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [restaurant_controller_1.RestaurantController],
        }).compile();
        controller = module.get(restaurant_controller_1.RestaurantController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=restaurant.controller.spec.js.map