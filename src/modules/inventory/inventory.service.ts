import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventoryItems(orgId: string) {
    return this.prisma.client.inventoryItem.findMany({
      where: { organizationId: orgId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async createInventoryItem(orgId: string, data: any) {
    return this.prisma.client.inventoryItem.create({
      data: {
        organizationId: orgId,
        name: data.name,
        sku: data.sku,
        unit: data.unit,
        quantity: data.quantity || 0,
        minQuantity: data.minQuantity || 0,
      },
    });
  }

  async addStockTransaction(itemId: string, orgId: string, data: any) {
    const item = await this.prisma.client.inventoryItem.findFirst({
      where: { id: itemId, organizationId: orgId },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const newQuantity = data.type === 'IN' 
      ? item.quantity + data.quantity 
      : item.quantity - data.quantity;

    await this.prisma.client.inventoryItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });

    return this.prisma.client.inventoryTransaction.create({
      data: {
        itemId,
        type: data.type, // IN, OUT, WASTE
        quantity: data.quantity,
        reference: data.reference,
      },
    });
  }
}
