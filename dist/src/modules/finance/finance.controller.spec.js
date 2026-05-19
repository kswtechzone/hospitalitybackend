"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const finance_controller_1 = require("./finance.controller");
describe('FinanceController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [finance_controller_1.FinanceController],
        }).compile();
        controller = module.get(finance_controller_1.FinanceController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=finance.controller.spec.js.map