"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cms_service_1 = require("./cms.service");
describe('CmsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [cms_service_1.CmsService],
        }).compile();
        service = module.get(cms_service_1.CmsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=cms.service.spec.js.map