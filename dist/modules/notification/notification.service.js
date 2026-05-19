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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationService = class NotificationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.notificationSubject = new rxjs_1.Subject();
    }
    getNotificationStream(userId) {
        return this.notificationSubject.asObservable().pipe((0, operators_1.filter)((event) => event.userId === userId || event.userId === 'ALL'), (0, operators_1.map)((event) => event.notification));
    }
    async createNotification(userId, title, message) {
        const notification = await this.prisma.client.notification.create({
            data: {
                userId,
                title,
                message,
            },
        });
        this.notificationSubject.next({
            userId,
            notification,
        });
        return notification;
    }
    async getNotifications(userId) {
        return this.prisma.client.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async markAsRead(id) {
        return this.prisma.client.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.client.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map