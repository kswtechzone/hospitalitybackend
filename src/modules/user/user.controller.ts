import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll() {
    return this.userService.getAllUsers();
  }

  @Get('organization/:orgId')
  async getByOrg(@Param('orgId') orgId: string) {
    return this.userService.getOrganizationUsers(orgId);
  }

  @Post('organization/:orgId')
  async createInOrg(@Param('orgId') orgId: string, @Body() data: any) {
    return this.userService.createOrganizationUser(orgId, data);
  }

  @Delete(':id/organization/:orgId')
  async delete(@Param('id') id: string, @Param('orgId') orgId: string) {
    return this.userService.deleteUser(orgId, id);
  }
}
