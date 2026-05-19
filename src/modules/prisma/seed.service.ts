import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminEmail = 'sanjay@kswtechzone.com.np';
    const password = 'Ksw@123';
    
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      
      const existingAdmin = await this.prisma.client.user.findUnique({
        where: { email: adminEmail },
      });

      if (!existingAdmin) {
        console.log('--- Bootstrapping Initial Super Admin ---');
        
        // Ensure Organization exists
        const org = await this.prisma.client.organization.upsert({
          where: { slug: 'ksw-hq' },
          update: {},
          create: {
            name: 'KSWMS HQ',
            slug: 'ksw-hq',
            enabledModules: ['DASHBOARD', 'HOTEL_MANAGEMENT'],
          },
        });

        await this.prisma.client.user.create({
          data: {
            email: adminEmail,
            passwordHash,
            name: 'Sanjay Kumar',
            role: 'SUPER_ADMIN',
            organizationId: org.id,
          },
        });
        console.log(`Initial Admin Created: ${adminEmail} / ${password}`);
      } else {
        // Force reset password to ensure it matches Ksw@123
        await this.prisma.client.user.update({
          where: { email: adminEmail },
          data: { passwordHash }
        });
        console.log(`Admin ${adminEmail} verified and password reset to default.`);
      }
    } catch (error) {
      console.error('Failed to seed initial admin:', error);
    }
  }
}
