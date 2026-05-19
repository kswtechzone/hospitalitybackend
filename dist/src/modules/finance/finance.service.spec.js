"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const finance_service_1 = require("./finance.service");
describe('FinanceService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [finance_service_1.FinanceService],
        }).compile();
        service = module.get(finance_service_1.FinanceService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=finance.service.spec.js.map