import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getInventoryItems(@Request() req) {
    return this.inventoryService.getInventoryItems(req.tenantId);
  }

  @Post()
  createInventoryItem(@Body() data: any, @Request() req) {
    return this.inventoryService.createInventoryItem(req.tenantId, data);
  }

  @Post(':id/transactions')
  addStockTransaction(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.inventoryService.addStockTransaction(id, req.tenantId, data);
  }
}
