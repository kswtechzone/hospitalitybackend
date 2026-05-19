import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getStaff(orgId: string) {
    return this.prisma.client.staff.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });
  }

  async createStaff(orgId: string, data: any) {
    return this.prisma.client.staff.create({
      data: {
        organizationId: orgId,
        userId: data.userId,
        designation: data.designation,
        salary: data.salary,
        joiningDate: new Date(data.joiningDate),
        status: data.status || 'ACTIVE',
      },
    });
  }

  async addAttendance(staffId: string, orgId: string, data: any) {
    const staff = await this.prisma.client.staff.findFirst({
      where: { id: staffId, organizationId: orgId },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return this.prisma.client.attendance.create({
      data: {
        staffId,
        date: new Date(data.date),
        clockIn: data.clockIn ? new Date(data.clockIn) : null,
        clockOut: data.clockOut ? new Date(data.clockOut) : null,
        status: data.status || 'PRESENT',
      },
    });
  }
}
