import { PrismaService } from '../prisma/prisma.service';
export declare class WebsiteService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrgBrands(orgId: string): Promise<any>;
    getWebsites(orgId: string): Promise<any>;
    getWebsiteById(id: string, orgId: string): Promise<any>;
    createWebsite(orgId: string, data: any): Promise<any>;
    updateWebsite(id: string, orgId: string, data: any): Promise<any>;
    deleteWebsite(id: string, orgId: string): Promise<any>;
    createPage(websiteId: string, orgId: string, data: any): Promise<any>;
    updatePage(pageId: string, orgId: string, data: any): Promise<any>;
    deletePage(pageId: string, orgId: string): Promise<any>;
    createSection(pageId: string, orgId: string, data: any): Promise<any>;
    updateSection(sectionId: string, orgId: string, data: any): Promise<any>;
    deleteSection(sectionId: string, orgId: string): Promise<any>;
}
