"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const restaurant_service_1 = require("./restaurant.service");
describe('RestaurantService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [restaurant_service_1.RestaurantService],
        }).compile();
        service = module.get(restaurant_service_1.RestaurantService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=restaurant.service.spec.js.map