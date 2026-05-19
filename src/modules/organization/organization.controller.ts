import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get()
  async getAll() {
    return this.orgService.getAllOrganizations();
  }

  @Get('logs')
  async getLogs() {
    return this.orgService.getActivityLogs();
  }

  @Get('stats')
  async getStats() {
    return this.orgService.getDashboardStats();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.orgService.getOrganizationById(id);
  }

  @Get(':id/brands')
  async getBrands(@Param('id') id: string) {
    return this.orgService.getBrands(id);
  }

  @Put(':id/modules')
  async updateModules(@Param('id') id: string, @Body('modules') modules: string[]) {
    return this.orgService.updateModules(id, modules);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() data: { country?: string; currency?: string; name?: string }
  ) {
    return this.orgService.updateOrganizationProfile(id, data);
  }

  @Post(':id/toggle-module')
  async toggleModule(@Param('id') id: string, @Body('moduleName') moduleName: string) {
    return this.orgService.toggleModule(id, moduleName);
  }
}
