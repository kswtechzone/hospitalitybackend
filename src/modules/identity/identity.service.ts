import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class IdentityService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new PlatformUser in the central system.
   */
  async register(data: any) {
    const { username, email, phone, password } = data;

    if (!username || !email || !password) {
      throw new BadRequestException('Username, email, and password are required');
    }

    const existingUser = await this.prisma.client.platformUser.findFirst({
      where: {
        OR: [
          { username },
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('A platform user with this username, email, or phone already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.client.platformUser.create({
      data: {
        username,
        email,
        phone: phone || null,
        passwordHash,
        isVerified: true, // Default to true for sandbox/demo, can hook into OTP verify
      },
    });

    return this.generateAuthTokens(user, null, 'STAFF');
  }

  /**
   * Authenticates user and returns access and refresh tokens.
   */
  async login(data: any) {
    const { username, password } = data;

    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const user = await this.prisma.client.platformUser.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid platform credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid platform credentials');
    }

    // Default to the first active organization membership if available
    const activeMembership = user.memberships[0] || null;
    const orgId = activeMembership?.organizationId || '';
    const role = activeMembership?.role || 'STAFF';

    return this.generateAuthTokens(user, orgId, role);
  }

  /**
   * Refreshes access token using a valid platform refresh token.
   */
  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET_KEY || 'ksw_central_secret_key_2026',
      });

      const user = await this.prisma.client.platformUser.findUnique({
        where: { id: decoded.userId || decoded.sub },
        include: {
          memberships: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Platform user not found');
      }

      const activeMembership = user.memberships[0] || null;
      const orgId = activeMembership?.organizationId || '';
      const role = activeMembership?.role || 'STAFF';

      return this.generateAuthTokens(user, orgId, role);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Retrieves profile details for the authenticated user.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.client.platformUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                subscriptionPlan: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Platform user not found');
    return user;
  }

  /**
   * Helper: Generates centralized JWT Access and Refresh tokens.
   */
  private async generateAuthTokens(user: any, organizationId: string | null, role: string) {
    const payload = {
      userId: user.id,
      sub: user.id,
      email: user.email,
      organizationId: organizationId || '',
      role,
      permissions: organizationId ? ['READ', 'WRITE'] : [],
      accessibleSystems: ['hospitality', 'crm', 'pos', 'website'],
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY || 'ksw_central_secret_key_2026',
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(
      { userId: user.id, purpose: 'refresh' },
      {
        secret: process.env.JWT_SECRET_KEY || 'ksw_central_secret_key_2026',
        expiresIn: '7d',
      },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        activeMembership: organizationId
          ? {
              organizationId,
              role,
            }
          : null,
      },
    };
  }

  /**
   * Registers a new platform organization.
   */
  async createOrganization(data: any) {
    const { name, slug, subscriptionPlan } = data;

    if (!name || !slug) {
      throw new BadRequestException('Organization name and URL slug are required');
    }

    const existing = await this.prisma.client.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('An organization with this URL slug already exists');
    }

    return this.prisma.client.organization.create({
      data: {
        name,
        slug,
        subscriptionPlan: subscriptionPlan || 'FREE',
        enabledModules: ['DASHBOARD'],
      },
    });
  }

  /**
   * Invites / registers a user into an organization.
   */
  async inviteUserToOrganization(orgId: string, inviteData: any) {
    const { email, role } = inviteData;

    if (!email) throw new BadRequestException('Invite email address is required');

    const organization = await this.prisma.client.organization.findUnique({
      where: { id: orgId },
    });
    if (!organization) throw new NotFoundException('Organization not found');

    // Find the PlatformUser by email
    const user = await this.prisma.client.platformUser.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('Platform User not registered. Please register on kswtechzone.com first.');
    }

    // Check for existing membership
    const existingMembership = await this.prisma.client.organizationMembership.findUnique({
      where: {
        organizationId_platformUserId: {
          organizationId: orgId,
          platformUserId: user.id,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this organization');
    }

    return this.prisma.client.organizationMembership.create({
      data: {
        organizationId: orgId,
        platformUserId: user.id,
        role: role || 'STAFF',
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Core Customer Deduping and Linking Engine.
   */
  async linkCustomerToOrganization(orgId: string, customerData: any) {
    const { fullName, phone, email, notes, tags } = customerData;

    if (!fullName) throw new BadRequestException('Customer fullName is required');
    if (!phone && !email) {
      throw new BadRequestException('Either telephone number or email address is required for unique matching');
    }

    // 1. Search global ledger for matching phone or email
    const existingGlobal = await this.prisma.client.customer.findFirst({
      where: {
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    let customerId: string;

    if (existingGlobal) {
      // Re-use central global profile
      customerId = existingGlobal.id;

      // Update missing contacts if not present
      if ((phone && !existingGlobal.phone) || (email && !existingGlobal.email)) {
        await this.prisma.client.customer.update({
          where: { id: customerId },
          data: {
            phone: existingGlobal.phone || phone,
            email: existingGlobal.email || email,
          },
        });
      }
    } else {
      // Create new central global Customer identity
      const newCust = await this.prisma.client.customer.create({
        data: {
          fullName,
          phone: phone || null,
          email: email || null,
        },
      });
      customerId = newCust.id;
    }

    // 2. Prevent duplicate relationships and secure tenant boundary
    const existingLink = await this.prisma.client.customerOrganization.findUnique({
      where: {
        customerId_organizationId: {
          customerId,
          organizationId: orgId,
        },
      },
    });

    if (existingLink) {
      return this.prisma.client.customerOrganization.update({
        where: { id: existingLink.id },
        data: {
          notes: notes ? { note: notes } : existingLink.notes,
          tags: tags || existingLink.tags,
        },
        include: { customer: true },
      });
    }

    return this.prisma.client.customerOrganization.create({
      data: {
        customerId,
        organizationId: orgId,
        loyaltyPoints: 0,
        notes: notes ? { note: notes } : {},
        tags: tags || [],
      },
      include: { customer: true },
    });
  }
}
