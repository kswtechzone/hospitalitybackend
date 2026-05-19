import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async getGuests(orgId: string) {
    const guests = await this.prisma.client.guestProfile.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
    return guests.map(g => ({
      ...g,
      preferences: g.preferences && typeof g.preferences === 'object' && 'note' in g.preferences 
        ? (g.preferences as any).note 
        : (g.preferences as string || '')
    }));
  }

  async getGuestById(orgId: string, id: string) {
    const guest = await this.prisma.client.guestProfile.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!guest) throw new NotFoundException('Customer profile not found');
    return {
      ...guest,
      preferences: guest.preferences && typeof guest.preferences === 'object' && 'note' in guest.preferences 
        ? (guest.preferences as any).note 
        : (guest.preferences as string || '')
    };
  }

  async searchGuests(orgId: string, query: string) {
    if (!query) return [];
    const guests = await this.prisma.client.guestProfile.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
    return guests.map(g => ({
      ...g,
      preferences: g.preferences && typeof g.preferences === 'object' && 'note' in g.preferences 
        ? (g.preferences as any).note 
        : (g.preferences as string || '')
    }));
  }

  async createGuest(orgId: string, data: any) {
    const guest = await this.prisma.client.guestProfile.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        preferences: data.preferences ? { note: data.preferences } : {},
        organizationId: orgId,
      },
    });
    return {
      ...guest,
      preferences: data.preferences || ''
    };
  }

  async updateGuest(orgId: string, id: string, data: any) {
    await this.getGuestById(orgId, id);

    const guest = await this.prisma.client.guestProfile.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        preferences: data.preferences ? { note: data.preferences } : {},
      },
    });
    return {
      ...guest,
      preferences: data.preferences || ''
    };
  }

  async deleteGuest(orgId: string, id: string) {
    await this.getGuestById(orgId, id);

    return this.prisma.client.guestProfile.delete({
      where: { id },
    });
  }
}
