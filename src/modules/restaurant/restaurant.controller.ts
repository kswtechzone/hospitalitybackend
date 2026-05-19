import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('all')
  getAllRestaurants() {
    return this.restaurantService.getAllRestaurants();
  }

  @Get()
  getRestaurants(@Request() req) {
    return this.restaurantService.getRestaurants(req.tenantId);
  }

  @Post()
  createRestaurant(@Body() data: any, @Request() req) {
    return this.restaurantService.createRestaurant(req.tenantId, data, req.user.role);
  }

  @Get(':id/menus')
  getMenu(@Param('id') id: string, @Request() req) {
    console.log(`[RestaurantController] GET menus for restaurant: ${id}, tenant: ${req.tenantId}`);
    return this.restaurantService.getMenu(id, req.tenantId);
  }

  @Post(':id/menus')
  createMenu(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.restaurantService.createMenu(id, req.tenantId, data);
  }

  @Post(':id/menus/:menuId/categories')
  createCategory(@Param('id') restaurantId: string, @Param('menuId') menuId: string, @Body() data: any, @Request() req) {
    return this.restaurantService.createCategory(menuId, req.tenantId, data);
  }

  @Post(':id/categories/:categoryId/items')
  createMenuItem(@Param('id') restaurantId: string, @Param('categoryId') categoryId: string, @Body() data: any, @Request() req) {
    return this.restaurantService.createMenuItem(categoryId, req.tenantId, data);
  }

  @Post(':id/orders')
  createOrder(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.restaurantService.createOrder(id, req.tenantId, data);
  }
}
