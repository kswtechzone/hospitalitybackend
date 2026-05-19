import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getAllOrganizations() {
    return this.prisma.client.organization.findMany({
      include: {
        _count: {
          select: { users: true, hotels: true }
        }
      }
    });
  }

  async getOrganizationById(id: string) {
    const org = await this.prisma.client.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            users: true, 
            hotels: true, 
            restaurants: true,
            websites: true,
            orders: true,
            inventory: true,
            staff: true,
            parlorServices: true,
            parlorBookings: true,
            guests: true
          }
        }
      }
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateModules(orgId: string, modules: string[]) {
    const org = await this.prisma.client.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    const updatedOrg = await this.prisma.client.organization.update({
      where: { id: orgId },
      data: { enabledModules: modules }
    });

    // Create Audit Log
    await this.prisma.client.activityLog.create({
      data: {
        adminId: 'SYSTEM', // Replace with actual admin ID from request context in production
        adminName: 'Super Admin',
        action: 'ASSIGN_MODULES',
        targetType: 'ORGANIZATION',
        targetId: orgId,
        details: `Updated modules for ${org.name} to [${modules.join(', ')}]`
      }
    });

    return updatedOrg;
  }

  async toggleModule(orgId: string, moduleName: string) {
    const org = await this.prisma.client.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    let newModules = [...org.enabledModules];
    const isAdding = !newModules.includes(moduleName);
    if (newModules.includes(moduleName)) {
      newModules = newModules.filter(m => m !== moduleName);
    } else {
      newModules.push(moduleName);
    }

    const updatedOrg = await this.prisma.client.organization.update({
      where: { id: orgId },
      data: { enabledModules: newModules }
    });

    // Create Audit Log
    await this.prisma.client.activityLog.create({
      data: {
        adminId: 'SYSTEM',
        adminName: 'Super Admin',
        action: isAdding ? 'ASSIGN_MODULE' : 'REMOVE_MODULE',
        targetType: 'ORGANIZATION',
        targetId: orgId,
        details: `${isAdding ? 'Assigned' : 'Removed'} ${moduleName} for ${org.name}`
      }
    });

    return updatedOrg;
  }

  async getActivityLogs() {
    return this.prisma.client.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async getDashboardStats() {
    const [orgCount, userCount, hotelCount, recentLogs] = await Promise.all([
      this.prisma.client.organization.count(),
      this.prisma.client.user.count(),
      this.prisma.client.hotel.count(),
      this.prisma.client.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return {
      orgCount,
      userCount,
      hotelCount,
      recentLogs
    };
  }

  async getBrands(orgId: string) {
    return this.prisma.client.brand.findMany({
      where: { organizationId: orgId }
    });
  }

  async updateOrganizationProfile(id: string, data: { country?: string; currency?: string; name?: string }) {
    const org = await this.prisma.client.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');

    return this.prisma.client.organization.update({
      where: { id },
      data,
    });
  }
}
