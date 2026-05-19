import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication context not found.');
    }

    // 1. Get tenant ID from header or default to user's orgId
    const headerTenantId = request.headers['x-tenant-id'];
    
    if (user.role === 'SUPER_ADMIN') {
      // Super Admins can access any tenant specified in the header, or default to their own
      request.tenantId = headerTenantId || user.orgId;
    } else {
      // Org Admins are locked to their own orgId
      request.tenantId = user.orgId;
      
      // Safety check: if they try to pass a different x-tenant-id, block it
      if (headerTenantId && headerTenantId !== user.orgId) {
        throw new ForbiddenException('Unauthorized tenant access.');
      }
    }
    
    return true;
  }
}
