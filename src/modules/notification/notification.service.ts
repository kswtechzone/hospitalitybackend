import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

interface RealTimeNotificationEvent {
  userId: string;
  notification: any;
}

@Injectable()
export class NotificationService {
  // Global Subject to broadcast real-time events to active subscribers
  private notificationSubject = new Subject<RealTimeNotificationEvent>();

  constructor(private prisma: PrismaService) {}

  /**
   * Register active user to their SSE stream
   */
  getNotificationStream(userId: string): Observable<any> {
    return this.notificationSubject.asObservable().pipe(
      filter((event) => event.userId === userId || event.userId === 'ALL'),
      map((event) => event.notification)
    );
  }

  /**
   * Create a notification, save to DB, and broadcast to client real-time
   */
  async createNotification(userId: string, title: string, message: string) {
    const notification = await this.prisma.client.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });

    // Broadcast the real-time event
    this.notificationSubject.next({
      userId,
      notification,
    });

    return notification;
  }

  /**
   * Get all notifications for user
   */
  async getNotifications(userId: string) {
    return this.prisma.client.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string) {
    return this.prisma.client.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string) {
    return this.prisma.client.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
