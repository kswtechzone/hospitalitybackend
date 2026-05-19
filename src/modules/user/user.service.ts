import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createOrganizationUser(orgId: string, data: any) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.client.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role, // ORG_ADMIN, ORG_MANAGER, ORG_STAFF
        organizationId: orgId,
      },
    });
  }

  async getOrganizationUsers(orgId: string) {
    return this.prisma.client.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.client.user.findMany({
      include: { organization: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteUser(orgId: string, userId: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user || user.organizationId !== orgId) {
      throw new ForbiddenException('Unauthorized to delete this user');
    }

    return this.prisma.client.user.delete({ where: { id: userId } });
  }
}
