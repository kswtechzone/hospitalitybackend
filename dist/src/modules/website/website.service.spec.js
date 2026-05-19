"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const website_service_1 = require("./website.service");
describe('WebsiteService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [website_service_1.WebsiteService],
        }).compile();
        service = module.get(website_service_1.WebsiteService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=website.service.spec.js.map