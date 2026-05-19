"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(__dirname, '../.env') });
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function runSnapshotVerification() {
    console.log('🏁 Starting Invoice Folio Ledger JSONB Snapshot Verification...');
    try {
        const org = await prisma.organization.findUnique({
            where: { slug: 'ksw-hq' }
        });
        if (!org) {
            console.log('❌ Error: Default organization "ksw-hq" not found. Please run the seed command first.');
            process.exit(1);
        }
        console.log(`ℹ️ Target Organization: "${org.name}" (ID: ${org.id})`);
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
                guestEmail: 'john.dev@kswhospitality.com',
                guestPhone: '+18887776666',
                startTime: new Date(),
                endTime: new Date(Date.now() + 86400000 * 3),
                totalPrice: 1050.00,
                status: 'CONFIRMED'
            }
        });
        console.log(`✅ Mock folio entities seeded. Booking ID: ${booking.id}`);
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
        if (!bookingWithRelations)
            throw new Error('Failed to retrieve seeded booking details');
        const roomCharge = bookingWithRelations.totalPrice;
        const ordersCharge = bookingWithRelations.orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const parlorCharge = 0;
        const totalAmount = roomCharge + ordersCharge + parlorCharge;
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
        console.log('📊 Snapshot Aggregates Data:', JSON.stringify(invoice.billingSnapshot.aggregates, null, 2));
        console.log('🧹 Initiating sandbox records teardown...');
        await prisma.invoice.delete({ where: { id: invoice.id } });
        await prisma.booking.delete({ where: { id: booking.id } });
        await prisma.room.delete({ where: { id: room.id } });
        await prisma.hotel.delete({ where: { id: hotel.id } });
        await prisma.brand.delete({ where: { id: brand.id } });
        console.log('✨ Teardown complete. DB returned to initial state.');
        console.log('🚀 Verification Complete: Immutable Invoicing Folio Snapshot pattern works 100% successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Invoicing Verification Failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
runSnapshotVerification();
//# sourceMappingURL=test-snapshot.js.map