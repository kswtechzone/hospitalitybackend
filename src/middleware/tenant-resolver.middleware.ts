import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    // e.g., platinum-resort.kswhospitality.com
    // or customdomain.com

    let website = null;

    if (host.includes('localhost') || host.includes('127.0.0.1')) {
       // Development fallback or pass-through
       // Could extract subdomain from localhost too: sub.localhost:3000
       const subdomain = host.split('.')[0];
       if (subdomain !== 'localhost' && subdomain !== '127') {
           website = await this.prisma.client.website.findUnique({
               where: { subdomain }
           });
       }
    } else {
        // Production resolution
        const isCustomDomain = !host.includes('kswhospitality.com'); // Example platform domain
        if (isCustomDomain) {
            website = await this.prisma.client.website.findUnique({
                where: { customDomain: host }
            });
        } else {
            const subdomain = host.split('.')[0];
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
