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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinanceService = class FinanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInvoices(orgId) {
        return this.prisma.client.invoice.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createInvoice(orgId, data) {
        return this.prisma.client.invoice.create({
            data: {
                organizationId: orgId,
                bookingId: data.bookingId,
                orderId: data.orderId,
                invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
                totalAmount: data.totalAmount,
                tax: data.tax || 0,
                status: data.status || 'UNPAID',
                billingSnapshot: data.billingSnapshot || null,
            },
        });
    }
    async generateBookingInvoice(orgId, bookingId) {
        const booking = await this.prisma.client.booking.findFirst({
            where: { id: bookingId, organizationId: orgId },
            include: {
                orders: {
                    where: { status: { not: 'CANCELLED' } },
                    include: {
                        items: {
                            include: { menuItem: true }
                        }
                    }
                },
                room: {
                    include: { hotel: true }
                }
            }
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const parlorBookings = await this.prisma.client.serviceBooking.findMany({
            where: { bookingId, organizationId: orgId },
            include: {
                services: {
                    include: { service: true }
                }
            }
        });
        const roomCharge = booking.totalPrice;
        const ordersCharge = booking.orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const parlorCharge = parlorBookings.reduce((sum, pb) => sum + pb.totalPrice, 0);
        const totalAmount = roomCharge + ordersCharge + parlorCharge;
        const billingSnapshot = {
            checkoutTime: new Date().toISOString(),
            roomStaySnapshot: {
                roomId: booking.room.id,
                roomNumber: booking.room.roomNumber,
                roomType: booking.room.type,
                dailyRate: booking.room.dailyRate,
                hourlyRates: {
                    rate3h: booking.room.rate3h,
                    rate6h: booking.room.rate6h,
                    rate9h: booking.room.rate9h,
                    rate12h: booking.room.rate12h
                },
                hotelName: booking.room.hotel.name,
                guestName: booking.guestName,
                guestEmail: booking.guestEmail,
                guestPhone: booking.guestPhone,
                checkIn: booking.startTime.toISOString(),
                checkOut: booking.endTime.toISOString(),
                stayCost: roomCharge
            },
            restaurantOrdersSnapshot: booking.orders.map(order => ({
                orderId: order.id,
                tableId: order.tableId,
                orderTime: order.createdAt.toISOString(),
                totalPrice: order.totalPrice,
                items: order.items.map(item => ({
                    itemName: item.menuItem?.name || 'Unknown POS Item',
                    unitPrice: item.price,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity
                }))
            })),
            parlorBookingsSnapshot: parlorBookings.map(pb => ({
                bookingId: pb.id,
                guestName: pb.guestName,
                bookingTime: pb.bookingTime.toISOString(),
                totalPrice: pb.totalPrice,
                services: pb.services.map(ps => ({
                    serviceName: ps.service?.name || 'Spa Service',
                    priceAtBooking: ps.priceAtBooking
                }))
            })),
            aggregates: {
                roomCharge,
                ordersCharge,
                parlorCharge,
                totalAmount
            }
        };
        return this.prisma.client.invoice.create({
            data: {
                organizationId: orgId,
                bookingId: bookingId,
                invoiceNumber: `INV-B-${bookingId.slice(0, 8)}-${Date.now()}`,
                totalAmount: totalAmount,
                status: 'UNPAID',
                billingSnapshot: billingSnapshot
            }
        });
    }
    async getExpenses(orgId) {
        return this.prisma.client.expense.findMany({
            where: { organizationId: orgId },
            orderBy: { date: 'desc' },
        });
    }
    async createExpense(orgId, data) {
        return this.prisma.client.expense.create({
            data: {
                organizationId: orgId,
                category: data.category,
                amount: data.amount,
                description: data.description,
                date: data.date ? new Date(data.date) : new Date(),
            },
        });
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map