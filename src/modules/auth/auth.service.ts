import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    this.logger.log(`Registering new user: ${data.email} for org: ${data.orgName}`);

    // Check for existing user
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Check for existing organization slug
    const existingOrg = await this.prisma.client.organization.findUnique({
      where: { slug: data.orgSlug },
    });

    if (existingOrg) {
      throw new ConflictException('This organization URL slug is already taken');
    }

    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const result = await this.prisma.client.$transaction(async (tx) => {
        const org = await tx.organization.create({
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
}
