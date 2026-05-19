import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getInvoices(orgId: string) {
    return this.prisma.client.invoice.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(orgId: string, data: any) {
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

  async generateBookingInvoice(orgId: string, bookingId: string) {
    // 1. Fetch booking with its full room, orders, order items and menu details
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
      throw new NotFoundException('Booking not found');
    }

    // 2. Fetch all linked parlor bookings for this room stay
    const parlorBookings = await this.prisma.client.serviceBooking.findMany({
      where: { bookingId, organizationId: orgId },
      include: {
        services: {
          include: { service: true }
        }
      }
    });

    // 3. Calculate charges
    const roomCharge = booking.totalPrice;
    const ordersCharge = booking.orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const parlorCharge = parlorBookings.reduce((sum, pb) => sum + pb.totalPrice, 0);
    const totalAmount = roomCharge + ordersCharge + parlorCharge;

    // 4. Assemble the deep-cloned immutable snapshot
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

    // 5. Create unified invoice with the snapshot attached
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

  async getExpenses(orgId: string) {
    return this.prisma.client.expense.findMany({
      where: { organizationId: orgId },
      orderBy: { date: 'desc' },
    });
  }

  async createExpense(orgId: string, data: any) {
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
}
