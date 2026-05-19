"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const hr_service_1 = require("./hr.service");
describe('HrService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [hr_service_1.HrService],
        }).compile();
        service = module.get(hr_service_1.HrService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=hr.service.spec.js.map