import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('website/:websiteId/pages')
  getPages(@Param('websiteId') websiteId: string, @Request() req) {
    return this.cmsService.getPages(websiteId, req.tenantId);
  }

  @Post('website/:websiteId/pages')
  createPage(@Param('websiteId') websiteId: string, @Body() data: any, @Request() req) {
    return this.cmsService.createPage(websiteId, req.tenantId, data);
  }

  @Post('pages/:pageId/sections')
  createSection(@Param('pageId') pageId: string, @Body() data: any, @Request() req) {
    return this.cmsService.createSection(pageId, req.tenantId, data);
  }

  @Put('sections/:sectionId')
  updateSection(@Param('sectionId') sectionId: string, @Body() data: any, @Request() req) {
    return this.cmsService.updateSection(sectionId, req.tenantId, data);
  }
}
