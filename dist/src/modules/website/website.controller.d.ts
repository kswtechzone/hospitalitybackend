import { WebsiteService } from './website.service';
export declare class WebsiteController {
    private readonly websiteService;
    constructor(websiteService: WebsiteService);
    getOrgBrands(req: any): Promise<any>;
    getWebsites(req: any): Promise<any>;
    getWebsiteById(id: string, req: any): Promise<any>;
    createWebsite(data: any, req: any): Promise<any>;
    updateWebsite(id: string, data: any, req: any): Promise<any>;
    deleteWebsite(id: string, req: any): Promise<any>;
    createPage(websiteId: string, data: any, req: any): Promise<any>;
    updatePage(pageId: string, data: any, req: any): Promise<any>;
    deletePage(pageId: string, req: any): Promise<any>;
    createSection(pageId: string, data: any, req: any): Promise<any>;
    updateSection(sectionId: string, data: any, req: any): Promise<any>;
    deleteSection(sectionId: string, req: any): Promise<any>;
}
