import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromotionService } from '../promotion/promotion.service';

@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private promotionService: PromotionService,
  ) {}

  async getAllRestaurants() {
    return this.prisma.client.restaurant.findMany({
      include: { menus: true, tables: true, organization: true },
    });
  }

  async getRestaurants(orgId: string) {
    return this.prisma.client.restaurant.findMany({
      where: { organizationId: orgId },
      include: { menus: true, tables: true },
    });
  }

  async createRestaurant(orgId: string, data: any, role: string = 'ORG_ADMIN') {
    const targetOrgId = role === 'SUPER_ADMIN' && data.organizationId ? data.organizationId : orgId;
    return this.prisma.client.restaurant.create({
      data: {
        organizationId: targetOrgId,
        hotelId: data.hotelId,
        name: data.name,
        description: data.description,
      },
    });
  }

  // Menus
  async getMenu(restaurantId: string, orgId: string) {
    await this.verifyRestaurantOwnership(restaurantId, orgId);
    return this.prisma.client.menu.findMany({
      where: { restaurantId },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async createMenu(restaurantId: string, orgId: string, data: { name: string }) {
    console.log(`[RestaurantService] Creating/Finding menu for restaurant ${restaurantId} in org ${orgId}`);
    await this.verifyRestaurantOwnership(restaurantId, orgId);
    
    // Use findFirst to check if a menu with this name already exists for this restaurant
    const existingMenu = await this.prisma.client.menu.findFirst({
      where: { restaurantId, name: data.name },
      include: { categories: { include: { items: true } } }
    });

    if (existingMenu) return existingMenu;

    return this.prisma.client.menu.create({
      data: {
        restaurantId,
        name: data.name,
      },
      include: { categories: { include: { items: true } } }
    });
  }

  async createCategory(menuId: string, orgId: string, data: { name: string }) {
    console.log(`[RestaurantService] Creating category ${data.name} for menu ${menuId}`);
    
    // Verify menu belongs to an org-owned restaurant
    const menu = await this.prisma.client.menu.findFirst({
      where: { 
        id: menuId,
        restaurant: { organizationId: orgId }
      }
    });
    if (!menu) throw new NotFoundException('Menu not found or access denied');

    return this.prisma.client.menuCategory.create({
      data: {
        menuId,
        name: data.name,
      },
    });
  }

  async createMenuItem(categoryId: string, orgId: string, data: { name: string, price: number, description?: string }) {
    console.log(`[RestaurantService] Creating item ${data.name} for category ${categoryId}`);
    
    // Verify category belongs to an org-owned restaurant
    const category = await this.prisma.client.menuCategory.findFirst({
      where: {
        id: categoryId,
        menu: {
          restaurant: { organizationId: orgId }
        }
      }
    });
    if (!category) throw new NotFoundException('Category not found or access denied');

    return this.prisma.client.menuItem.create({
      data: {
        categoryId,
        name: data.name,
        price: data.price,
        description: data.description,
      },
    });
  }

  // Orders (POS)
  async createOrder(restaurantId: string, orgId: string, data: any) {
    await this.verifyRestaurantOwnership(restaurantId, orgId);
    
    // Calculate total price based on menu items
    let totalPrice = 0;
    const orderItems = [];

    for (const item of data.items) {
      const menuItem = await this.prisma.client.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) throw new BadRequestException(`Item ${item.menuItemId} not found`);
      
      const itemTotal = menuItem.price * item.quantity;
      totalPrice += itemTotal;
      
      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price, // Snapshot price
        notes: item.notes,
      });
    }

    let discountAmount = 0;
    let appliedCoupon = null;

    if (data.couponCode) {
      const validation = await this.promotionService.validateCoupon({
        code: data.couponCode,
        amount: totalPrice,
        moduleType: 'POS',
        customerId: data.customerId,
        organizationId: orgId,
      });

      if (!validation.valid) {
        throw new BadRequestException(validation.reason);
      }

      discountAmount = validation.discountAmount;
      appliedCoupon = data.couponCode.toUpperCase();
      totalPrice = validation.finalAmount;
    }

    const createdOrder = await this.prisma.client.order.create({
      data: {
        organizationId: orgId,
        restaurantId,
        tableId: data.tableId,
        type: data.type || 'DINE_IN',
        totalPrice,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    if (appliedCoupon) {
      await this.promotionService.redeemCoupon(
        appliedCoupon,
        totalPrice + discountAmount, // original amount before discount
        'POS',
        createdOrder.id,
        orgId,
        data.customerId,
      );
    }

    return createdOrder;
  }

  private async verifyRestaurantOwnership(restaurantId: string, orgId: string) {
    const restaurant = await this.prisma.client.restaurant.findFirst({
      where: { id: restaurantId, organizationId: orgId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
  }
}
