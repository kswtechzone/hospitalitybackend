"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cms_controller_1 = require("./cms.controller");
describe('CmsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [cms_controller_1.CmsController],
        }).compile();
        controller = module.get(cms_controller_1.CmsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=cms.controller.spec.js.map