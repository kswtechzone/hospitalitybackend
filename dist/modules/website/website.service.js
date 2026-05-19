"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WebsiteService = class WebsiteService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrgBrands(orgId) {
        return this.prisma.client.brand.findMany({
            where: { organizationId: orgId, deletedAt: null },
        });
    }
    async getWebsites(orgId) {
        return this.prisma.client.website.findMany({
            where: { organizationId: orgId, deletedAt: null },
            include: {
                brand: true,
                pages: {
                    include: {
                        sections: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
    }
    async getWebsiteById(id, orgId) {
        const website = await this.prisma.client.website.findFirst({
            where: { id, organizationId: orgId, deletedAt: null },
            include: {
                brand: true,
                pages: {
                    include: {
                        sections: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        if (!website) {
            throw new common_1.NotFoundException('Website not found');
        }
        return website;
    }
    async createWebsite(orgId, data) {
        let brandId = data.brandId;
        if (!brandId) {
            let brand = await this.prisma.client.brand.findFirst({
                where: { organizationId: orgId, deletedAt: null },
            });
            if (!brand) {
                brand = await this.prisma.client.brand.create({
                    data: {
                        organizationId: orgId,
                        name: data.title || 'Official Brand',
                        slug: `brand-${Date.now()}`,
                        themeColors: { primary: '#3b82f6', secondary: '#10b981', background: '#0b0f19', text: '#ffffff' },
                    },
                });
            }
            brandId = brand.id;
        }
        const RESERVED_SUBDOMAINS = ['admin', 'api', 'app', 'dashboard', 'kswms', 'www', 'mail', 'auth'];
        if (data.subdomain) {
            if (RESERVED_SUBDOMAINS.includes(data.subdomain.toLowerCase())) {
                throw new common_1.BadRequestException('Subdomain is reserved and cannot be used.');
            }
            const existing = await this.prisma.client.website.findUnique({
                where: { subdomain: data.subdomain },
            });
            if (existing && existing.deletedAt === null) {
                throw new common_1.BadRequestException('Subdomain is already taken');
            }
        }
        if (data.customDomain) {
            const existingDomain = await this.prisma.client.website.findUnique({
                where: { customDomain: data.customDomain },
            });
            if (existingDomain && existingDomain.deletedAt === null) {
                throw new common_1.BadRequestException('Custom domain is already registered to another website.');
            }
        }
        const website = await this.prisma.client.website.create({
            data: {
                organizationId: orgId,
                brandId: brandId,
                title: data.title || 'Official Website',
                description: data.description || 'Welcome to our premium hospitality resort and booking portal.',
                subdomain: data.subdomain || `site-${Date.now()}`,
                customDomain: data.customDomain || null,
                status: data.status || 'DRAFT',
                config: data.config || { theme: 'modern', font: 'Inter', primaryColor: '#3b82f6', headerStyle: 'glass', footerStyle: 'dark' },
            },
        });
        const homePage = await this.prisma.client.cMSPage.create({
            data: {
                websiteId: website.id,
                title: 'Home',
                slug: 'home',
                isHome: true,
                seoTitle: `${website.title} | Official Booking Portal`,
                seoDescription: website.description,
            },
        });
        await this.prisma.client.cMSSection.createMany({
            data: [
                {
                    pageId: homePage.id,
                    type: 'HERO',
                    order: 1,
                    content: {
                        headline: `Welcome to ${website.title}`,
                        subtitle: website.description || 'Experience world-class luxury, pristine rooms, and exquisite dining.',
                        ctaText: 'Book Your Stay',
                        ctaLink: '#rooms',
                        bgImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
                    },
                },
                {
                    pageId: homePage.id,
                    type: 'FEATURES',
                    order: 2,
                    content: {
                        title: 'Our Premium Amenities',
                        subtitle: 'Designed for your absolute comfort and relaxation.',
                        items: [
                            { title: 'Luxury Suites', description: 'Elegantly appointed rooms with breathtaking ocean and mountain views.', icon: 'Hotel' },
                            { title: 'Fine Dining', description: 'Michelin-star culinary experiences crafted by world-renowned chefs.', icon: 'Utensils' },
                            { title: 'Wellness Spa & Salon', description: 'Rejuvenating massage therapy, hydrotherapy, and premium beauty services.', icon: 'Sparkles' },
                        ],
                    },
                },
                {
                    pageId: homePage.id,
                    type: 'ROOMS',
                    order: 3,
                    content: {
                        title: 'Featured Accommodations',
                        subtitle: 'Choose from our exquisite collection of rooms and suites ready for immediate reservation.',
                    },
                },
                {
                    pageId: homePage.id,
                    type: 'TESTIMONIALS',
                    order: 4,
                    content: {
                        title: 'Guest Experiences',
                        subtitle: 'What our wonderful visitors say about their stays.',
                        items: [
                            { quote: 'An absolutely magical stay! The hospitality was unmatched and the spa treatments were heavenly.', author: 'Elena Rostova', role: 'Platinum Guest' },
                            { quote: 'The finest dining experience I have ever had at a resort. Will definitely be returning every summer!', author: 'Marcus Vance', role: 'Verified Guest' },
                        ],
                    },
                },
            ],
        });
        return this.getWebsiteById(website.id, orgId);
    }
    async updateWebsite(id, orgId, data) {
        const website = await this.prisma.client.website.findFirst({
            where: { id, organizationId: orgId, deletedAt: null },
        });
        if (!website) {
            throw new common_1.NotFoundException('Website not found');
        }
        if (data.customDomain) {
            const existing = await this.prisma.client.website.findUnique({
                where: { customDomain: data.customDomain },
            });
            if (existing && existing.id !== id && existing.deletedAt === null) {
                throw new common_1.BadRequestException('Custom domain is already registered to another website.');
            }
        }
        return this.prisma.client.website.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                subdomain: data.subdomain,
                customDomain: data.customDomain,
                status: data.status,
                config: data.config,
            },
        });
    }
    async deleteWebsite(id, orgId) {
        const website = await this.prisma.client.website.findFirst({
            where: { id, organizationId: orgId, deletedAt: null },
        });
        if (!website) {
            throw new common_1.NotFoundException('Website not found');
        }
        return this.prisma.client.website.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async createPage(websiteId, orgId, data) {
        const website = await this.prisma.client.website.findFirst({
            where: { id: websiteId, organizationId: orgId, deletedAt: null },
        });
        if (!website)
            throw new common_1.NotFoundException('Website not found');
        const existingPage = await this.prisma.client.cMSPage.findFirst({
            where: { websiteId, slug: data.slug },
        });
        if (existingPage)
            throw new common_1.BadRequestException('A page with this URL slug already exists');
        const page = await this.prisma.client.cMSPage.create({
            data: {
                websiteId,
                title: data.title,
                slug: data.slug,
                isHome: data.isHome || false,
                seoTitle: data.seoTitle || `${data.title} | ${website.title}`,
                seoDescription: data.seoDescription || website.description,
            },
        });
        await this.prisma.client.cMSSection.create({
            data: {
                pageId: page.id,
                type: data.starterType || 'HERO',
                order: 1,
                content: {
                    headline: data.title,
                    subtitle: data.seoDescription || 'Explore our services and offerings.',
                    bgImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
                },
            },
        });
        return this.prisma.client.cMSPage.findUnique({
            where: { id: page.id },
            include: { sections: { orderBy: { order: 'asc' } } },
        });
    }
    async updatePage(pageId, orgId, data) {
        const page = await this.prisma.client.cMSPage.findUnique({
            where: { id: pageId },
            include: { website: true },
        });
        if (!page || page.website.organizationId !== orgId) {
            throw new common_1.NotFoundException('Page not found');
        }
        return this.prisma.client.cMSPage.update({
            where: { id: pageId },
            data: {
                title: data.title,
                slug: data.slug,
                isHome: data.isHome,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
            },
            include: { sections: { orderBy: { order: 'asc' } } },
        });
    }
    async deletePage(pageId, orgId) {
        const page = await this.prisma.client.cMSPage.findUnique({
            where: { id: pageId },
            include: { website: true },
        });
        if (!page || page.website.organizationId !== orgId) {
            throw new common_1.NotFoundException('Page not found');
        }
        if (page.isHome) {
            throw new common_1.BadRequestException('Cannot delete the home page of a website');
        }
        return this.prisma.client.cMSPage.delete({
            where: { id: pageId },
        });
    }
    async createSection(pageId, orgId, data) {
        const page = await this.prisma.client.cMSPage.findUnique({
            where: { id: pageId },
            include: { website: true, sections: true },
        });
        if (!page || page.website.organizationId !== orgId) {
            throw new common_1.NotFoundException('Page not found');
        }
        const nextOrder = page.sections.length + 1;
        let defaultContent = {};
        if (data.type === 'HERO') {
            defaultContent = { headline: 'New Hero Headline', subtitle: 'Engaging subtitle text here', ctaText: 'Learn More', ctaLink: '#', bgImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80' };
        }
        else if (data.type === 'FEATURES') {
            defaultContent = { title: 'Outstanding Features', subtitle: 'Discover what sets us apart.', items: [{ title: 'Feature 1', description: 'Description here', icon: 'Sparkles' }] };
        }
        else if (data.type === 'ROOMS') {
            defaultContent = { title: 'Our Luxury Rooms', subtitle: 'Available for instant booking.' };
        }
        else if (data.type === 'TESTIMONIALS') {
            defaultContent = { title: 'What Guests Say', subtitle: 'Genuine reviews from our visitors.', items: [{ quote: 'Wonderful stay!', author: 'Jane Doe', role: 'Guest' }] };
        }
        else if (data.type === 'PARLOR_SERVICES') {
            defaultContent = { title: 'Spa & Salon Treatments', subtitle: 'Browse our luxurious menu of wellness treatments and beauty services.' };
        }
        else {
            defaultContent = { title: 'New Custom Section', subtitle: 'Add descriptive text or media.' };
        }
        return this.prisma.client.cMSSection.create({
            data: {
                pageId,
                type: data.type || 'HERO',
                order: data.order || nextOrder,
                content: data.content || defaultContent,
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
        });
    }
    async updateSection(sectionId, orgId, data) {
        const section = await this.prisma.client.cMSSection.findUnique({
            where: { id: sectionId },
            include: { page: { include: { website: true } } },
        });
        if (!section || section.page.website.organizationId !== orgId) {
            throw new common_1.NotFoundException('Section not found');
        }
        return this.prisma.client.cMSSection.update({
            where: { id: sectionId },
            data: {
                type: data.type,
                content: data.content,
                order: data.order,
                isActive: data.isActive,
            },
        });
    }
    async deleteSection(sectionId, orgId) {
        const section = await this.prisma.client.cMSSection.findUnique({
            where: { id: sectionId },
            include: { page: { include: { website: true } } },
        });
        if (!section || section.page.website.organizationId !== orgId) {
            throw new common_1.NotFoundException('Section not found');
        }
        return this.prisma.client.cMSSection.delete({
            where: { id: sectionId },
        });
    }
};
exports.WebsiteService = WebsiteService;
exports.WebsiteService = WebsiteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebsiteService);
//# sourceMappingURL=website.service.js.map