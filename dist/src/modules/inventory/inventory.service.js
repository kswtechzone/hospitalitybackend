"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInventoryItems(orgId) {
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
    async createInventoryItem(orgId, data) {
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
    async addStockTransaction(itemId, orgId, data) {
        const item = await this.prisma.client.inventoryItem.findFirst({
            where: { id: itemId, organizationId: orgId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Inventory item not found');
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
                type: data.type,
                quantity: data.quantity,
                reference: data.reference,
            },
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map