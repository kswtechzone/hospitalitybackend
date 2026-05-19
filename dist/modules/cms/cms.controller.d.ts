import { CmsService } from './cms.service';
export declare class CmsController {
    private readonly cmsService;
    constructor(cmsService: CmsService);
    getPages(websiteId: string, req: any): Promise<any>;
    createPage(websiteId: string, data: any, req: any): Promise<any>;
    createSection(pageId: string, data: any, req: any): Promise<any>;
    updateSection(sectionId: string, data: any, req: any): Promise<any>;
}
