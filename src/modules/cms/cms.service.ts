import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // Pages
  async getPages(websiteId: string, orgId: string) {
    // Ensure website belongs to org
    await this.verifyWebsiteOwnership(websiteId, orgId);
    return this.prisma.client.cMSPage.findMany({
      where: { websiteId },
      include: { sections: { orderBy: { order: 'asc' } } }
    });
  }

  async createPage(websiteId: string, orgId: string, data: any) {
    await this.verifyWebsiteOwnership(websiteId, orgId);
    return this.prisma.client.cMSPage.create({
      data: {
        websiteId,
        title: data.title,
        slug: data.slug,
        isHome: data.isHome || false,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
    });
  }

  // Sections
  async createSection(pageId: string, orgId: string, data: any) {
    await this.verifyPageOwnership(pageId, orgId);
    return this.prisma.client.cMSSection.create({
      data: {
        pageId,
        type: data.type,
        content: data.content,
        order: data.order || 0,
      },
    });
  }

  async updateSection(id: string, orgId: string, data: any) {
    const section = await this.prisma.client.cMSSection.findUnique({
      where: { id },
      include: { page: { include: { website: true } } },
    });

    if (!section || section.page.website.organizationId !== orgId) {
      throw new NotFoundException('Section not found');
    }

    return this.prisma.client.cMSSection.update({
      where: { id },
      data,
    });
  }

  // Helper Methods
  private async verifyWebsiteOwnership(websiteId: string, orgId: string) {
    const website = await this.prisma.client.website.findFirst({
      where: { id: websiteId, organizationId: orgId },
    });
    if (!website) throw new NotFoundException('Website not found');
  }

  private async verifyPageOwnership(pageId: string, orgId: string) {
    const page = await this.prisma.client.cMSPage.findUnique({
      where: { id: pageId },
      include: { website: true },
    });
    if (!page || page.website.organizationId !== orgId) {
      throw new NotFoundException('Page not found');
    }
  }
}
