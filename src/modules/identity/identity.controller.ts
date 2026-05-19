import { Controller, Post, Get, Body, Param, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { IdentityService } from './identity.service';
import * as jwt from 'jsonwebtoken';

@Controller('identity')
export class IdentityController {
  constructor(private identityService: IdentityService) {}

  @Post('auth/register')
  register(@Body() data: any) {
    return this.identityService.register(data);
  }

  @Post('auth/login')
  login(@Body() data: any) {
    return this.identityService.login(data);
  }

  @Post('auth/refresh')
  refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.identityService.refresh(refreshToken);
  }

  @Get('auth/me')
  getProfile(@Request() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || 'ksw_central_secret_key_2026'
      );
      return this.identityService.getProfile(decoded.userId || decoded.sub);
    } catch {
      throw new UnauthorizedException('Invalid platform authentication token');
    }
  }

  @Post('organizations')
  createOrganization(@Body() data: any) {
    return this.identityService.createOrganization(data);
  }

  @Post('organizations/:id/invite')
  inviteUser(@Param('id') orgId: string, @Body() data: any) {
    return this.identityService.inviteUserToOrganization(orgId, data);
  }

  @Post('customers/link')
  linkCustomer(@Request() req, @Body() data: any) {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new UnauthorizedException('x-tenant-id header is required for customer operations');
    }
    return this.identityService.linkCustomerToOrganization(tenantId, data);
  }
}
