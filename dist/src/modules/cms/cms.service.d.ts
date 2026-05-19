import { PrismaService } from '../prisma/prisma.service';
export declare class CmsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPages(websiteId: string, orgId: string): Promise<any>;
    createPage(websiteId: string, orgId: string, data: any): Promise<any>;
    createSection(pageId: string, orgId: string, data: any): Promise<any>;
    updateSection(id: string, orgId: string, data: any): Promise<any>;
    private verifyWebsiteOwnership;
    private verifyPageOwnership;
}
