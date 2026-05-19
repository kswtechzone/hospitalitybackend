import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  async register(data: any) {
    this.logger.log(`Registering new user: ${data.email} with profile type: ${data.profileType || 'ORGANIZATION'}`);

    // Check for existing user
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const isUserType = data.profileType === 'USER';

    // Check for existing organization slug if registering as Organization
    if (!isUserType) {
      if (!data.orgSlug) {
        throw new BadRequestException('Organization slug is required');
      }
      const existingOrg = await this.prisma.client.organization.findUnique({
        where: { slug: data.orgSlug },
      });

      if (existingOrg) {
        throw new ConflictException('This organization URL slug is already taken');
      }
    }

    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const result = await this.prisma.client.$transaction(async (tx) => {
        let org;

        if (isUserType) {
          // Find or create default KSWUSER organization
          org = await tx.organization.findUnique({
            where: { slug: 'kswuser' },
          });

          if (!org) {
            org = await tx.organization.create({
              data: {
                name: 'KSWUSER Organization',
                slug: 'kswuser',
                enabledModules: ['DASHBOARD'],
                brands: {
                  create: {
                    name: 'KSWUSER',
                    slug: 'kswuser',
                  },
                },
              },
            });
          }
        } else {
          // Create custom organization
          org = await tx.organization.create({
            data: {
              name: data.orgName,
              slug: data.orgSlug,
              enabledModules: ['DASHBOARD'],
              brands: {
                create: {
                  name: data.orgName,
                  slug: data.orgSlug,
                },
              },
            },
          });
        }

        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash: hashedPassword,
            name: data.name,
            organizationId: org.id,
            role: 'ORG_ADMIN',
          },
          include: { organization: true }
        });

        return user;
      });

      this.logger.log(`Successfully registered: ${data.email}`);
      
      // Trigger welcome notification
      try {
        await this.notificationService.createNotification(
          data.email,
          'Welcome to KSW Hospitality!',
          `Hello ${data.name || 'User'}, your ${isUserType ? 'individual guest' : 'business management'} account has been registered successfully.`
        );
      } catch (e) {
        this.logger.error(`Failed to trigger welcome notification: ${e.message}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw new BadRequestException('Registration failed. Please ensure all data is valid.');
    }
  }

  async login(email: string, pass: string) {
    this.logger.log(`Login attempt: ${email}`);
    
    try {
      const user = await this.prisma.client.user.findUnique({
        where: { email },
        include: { organization: true },
      });

      if (!user) {
        this.logger.warn(`Login failed: User ${email} not found`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (!isMatch) {
        this.logger.warn(`Login failed: Password mismatch for ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { 
        sub: user.id, 
        email: user.email, 
        orgId: user.organizationId, 
        role: user.role 
      };

      this.logger.log(`Login successful: ${email}`);
      return {
        accessToken: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organization: user.organization,
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException('Login failed due to a system error');
    }
  }

  async getLoyaltyPoints(email: string) {
    if (!email) {
      return [];
    }

    const customer = await this.prisma.client.customer.findFirst({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return [];
    }

    return customer.organizations.map((orgLink: any) => ({
      organizationName: orgLink.organization?.name || 'Partner Merchant',
      organizationSlug: orgLink.organization?.slug || '',
      loyaltyPoints: orgLink.loyaltyPoints || 0,
      notes: orgLink.notes,
      tags: orgLink.tags,
    }));
  }
}
