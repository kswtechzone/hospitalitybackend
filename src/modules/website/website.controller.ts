import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/websites')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Get('brands')
  getOrgBrands(@Request() req) {
    return this.websiteService.getOrgBrands(req.tenantId);
  }

  @Get()
  getWebsites(@Request() req) {
    return this.websiteService.getWebsites(req.tenantId);
  }

  @Get(':id')
  getWebsiteById(@Param('id') id: string, @Request() req) {
    return this.websiteService.getWebsiteById(id, req.tenantId);
  }

  @Post()
  createWebsite(@Body() data: any, @Request() req) {
    return this.websiteService.createWebsite(req.tenantId, data);
  }

  @Put(':id')
  updateWebsite(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.websiteService.updateWebsite(id, req.tenantId, data);
  }

  @Delete(':id')
  deleteWebsite(@Param('id') id: string, @Request() req) {
    return this.websiteService.deleteWebsite(id, req.tenantId);
  }

  // --- CMS Page Endpoints ---

  @Post(':id/pages')
  createPage(@Param('id') websiteId: string, @Body() data: any, @Request() req) {
    return this.websiteService.createPage(websiteId, req.tenantId, data);
  }

  @Put('pages/:pageId')
  updatePage(@Param('pageId') pageId: string, @Body() data: any, @Request() req) {
    return this.websiteService.updatePage(pageId, req.tenantId, data);
  }

  @Delete('pages/:pageId')
  deletePage(@Param('pageId') pageId: string, @Request() req) {
    return this.websiteService.deletePage(pageId, req.tenantId);
  }

  // --- CMS Section Endpoints ---

  @Post('pages/:pageId/sections')
  createSection(@Param('pageId') pageId: string, @Body() data: any, @Request() req) {
    return this.websiteService.createSection(pageId, req.tenantId, data);
  }

  @Put('sections/:sectionId')
  updateSection(@Param('sectionId') sectionId: string, @Body() data: any, @Request() req) {
    return this.websiteService.updateSection(sectionId, req.tenantId, data);
  }

  @Delete('sections/:sectionId')
  deleteSection(@Param('sectionId') sectionId: string, @Request() req) {
    return this.websiteService.deleteSection(sectionId, req.tenantId);
  }
}
