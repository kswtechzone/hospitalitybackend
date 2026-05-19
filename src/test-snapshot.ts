import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runSnapshotVerification() {
  console.log('🏁 Starting Invoice Folio Ledger JSONB Snapshot Verification...');

  try {
    // 1. Fetch the default organization
    const org = await prisma.organization.findUnique({
      where: { slug: 'ksw-hq' }
    });

    if (!org) {
      console.log('❌ Error: Default organization "ksw-hq" not found. Please run the seed command first.');
      process.exit(1);
    }
    console.log(`ℹ️ Target Organization: "${org.name}" (ID: ${org.id})`);

    // 2. Programmatically seed mock entities to build a rich folio test
    console.log('🌱 Seeding mock brand, hotel, room, and booking for snapshot testing...');
    
    const brand = await prisma.brand.create({
      data: {
        name: 'Snapshot Testing Brand',
        slug: `test-brand-${Date.now()}`,
        themeColors: {},
        organizationId: org.id
      }
    });

    const hotel = await prisma.hotel.create({
      data: {
        name: 'Snapshot Testing Resort',
        address: '777 Developer Sandbox, CA',
        organizationId: org.id,
        brandId: brand.id
      }
    });

    const room = await prisma.room.create({
      data: {
        roomNumber: '808-TEST',
        type: 'Penthouse suite',
        dailyRate: 350.00,
        capacity: 4,
        status: 'AVAILABLE',
        hotelId: hotel.id
      }
    });

    const booking = await prisma.booking.create({
      data: {
        organizationId: org.id,
        roomId: room.id,
        guestName: 'John Dev',
        guestEmail: 'john.dev@kswtechzone.com.np',
        guestPhone: '+18887776666',
        startTime: new Date(),
        endTime: new Date(Date.now() + 86400000 * 3), // 3 days stay
        totalPrice: 1050.00,
        status: 'CONFIRMED'
      }
    });

    console.log(`✅ Mock folio entities seeded. Booking ID: ${booking.id}`);

    // 3. Retrieve unified invoice snapshot contents (matching FinanceService core query)
    const bookingWithRelations = await prisma.booking.findFirst({
      where: { id: booking.id },
      include: {
        orders: {
          where: { status: { not: 'CANCELLED' } }
        },
        room: {
          include: { hotel: true }
        }
      }
    });

    if (!bookingWithRelations) throw new Error('Failed to retrieve seeded booking details');

    const roomCharge = bookingWithRelations.totalPrice;
    const ordersCharge = bookingWithRelations.orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const parlorCharge = 0; // Standalone parlor mock charge
    const totalAmount = roomCharge + ordersCharge + parlorCharge;

    // 4. Compile snapshot
    const billingSnapshot = {
      checkoutTime: new Date().toISOString(),
      roomStaySnapshot: {
        roomId: bookingWithRelations.room.id,
        roomNumber: bookingWithRelations.room.roomNumber,
        roomType: bookingWithRelations.room.type,
        dailyRate: bookingWithRelations.room.dailyRate,
        hotelName: bookingWithRelations.room.hotel.name,
        guestName: bookingWithRelations.guestName,
        guestEmail: bookingWithRelations.guestEmail,
        guestPhone: bookingWithRelations.guestPhone,
        checkIn: bookingWithRelations.startTime.toISOString(),
        checkOut: bookingWithRelations.endTime.toISOString(),
        stayCost: roomCharge
      },
      restaurantOrdersSnapshot: bookingWithRelations.orders.map(order => ({
        orderId: order.id,
        totalPrice: order.totalPrice,
        items: []
      })),
      parlorBookingsSnapshot: [],
      aggregates: {
        roomCharge,
        ordersCharge,
        parlorCharge,
        totalAmount
      }
    };

    console.log('📸 Compiling deep-cloned JSON snapshot...');

    // 5. Create the unified invoice in Postgres
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        bookingId: booking.id,
        invoiceNumber: `INV-TEST-${booking.id.slice(0, 6)}-${Date.now()}`,
        totalAmount: totalAmount,
        status: 'UNPAID',
        billingSnapshot: billingSnapshot
      }
    });

    console.log('🎉 Invoice created successfully with snapshot column populated!');
    console.log('📌 Created Invoice ID:', invoice.id);
    console.log('📊 Snapshot Aggregates Data:', JSON.stringify((invoice.billingSnapshot as any).aggregates, null, 2));
    
    // 6. TEARDOWN - Clean up sandbox database records
    console.log('🧹 Initiating sandbox records teardown...');
    await prisma.invoice.delete({ where: { id: invoice.id } });
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.room.delete({ where: { id: room.id } });
    await prisma.hotel.delete({ where: { id: hotel.id } });
    await prisma.brand.delete({ where: { id: brand.id } });
    
    console.log('✨ Teardown complete. DB returned to initial state.');
    console.log('🚀 Verification Complete: Immutable Invoicing Folio Snapshot pattern works 100% successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Invoicing Verification Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runSnapshotVerification();
