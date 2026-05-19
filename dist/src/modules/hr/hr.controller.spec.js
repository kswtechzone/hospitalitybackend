"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const hr_controller_1 = require("./hr.controller");
describe('HrController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [hr_controller_1.HrController],
        }).compile();
        controller = module.get(hr_controller_1.HrController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=hr.controller.spec.js.map