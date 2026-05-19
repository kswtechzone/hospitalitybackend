import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const hostHeader = req.headers['x-tenant-host'] || req.headers.host || '';
    const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

    let website = null;

    if (host.includes('localhost') || host.includes('127.0.0.1')) {
       // Development fallback or pass-through
       const subdomain = host.split('.')[0];
       if (subdomain !== 'localhost' && subdomain !== '127') {
           website = await this.prisma.client.website.findUnique({
               where: { subdomain }
           });
       }
    } else {
        // Production resolution
        const isCustomDomain = !host.includes('kswtechzone.com.np') && !host.includes('kswtechzone.com'); 
        if (isCustomDomain) {
            website = await this.prisma.client.website.findUnique({
                where: { customDomain: host }
            });
        } else {
            const subdomain = host.split('.')[0];
            // Ignore system subdomains
            if (['kswms', 'ms', 'api', 'www', 'admin'].includes(subdomain)) {
                return next();
            }
            website = await this.prisma.client.website.findUnique({
                where: { subdomain }
            });
        }
    }

    if (website) {
      (req as any).resolvedTenantId = website.organizationId;
      (req as any).resolvedWebsiteId = website.id;
    }

    next();
  }
}
