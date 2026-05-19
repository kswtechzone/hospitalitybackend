"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const website_controller_1 = require("./website.controller");
describe('WebsiteController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [website_controller_1.WebsiteController],
        }).compile();
        controller = module.get(website_controller_1.WebsiteController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=website.controller.spec.js.map