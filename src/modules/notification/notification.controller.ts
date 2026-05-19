import { Controller, Get, Patch, Param, Query, Sse, MessageEvent, Post, Body } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Real-time Server-Sent Events stream for a specific user or guest email
   */
  @Sse('stream')
  streamNotifications(@Query('userId') userId: string): Observable<MessageEvent> {
    return this.notificationService.getNotificationStream(userId).pipe(
      map((notification) => ({
        data: notification,
      } as MessageEvent))
    );
  }

  /**
   * Fetch all notifications for a user/email
   */
  @Get()
  getNotifications(@Query('userId') userId: string) {
    return this.notificationService.getNotifications(userId);
  }

  /**
   * Trigger a manual broadcast (helpful for system/test notifications)
   */
  @Post()
  createNotification(
    @Body('userId') userId: string,
    @Body('title') title: string,
    @Body('message') message: string
  ) {
    return this.notificationService.createNotification(userId, title, message);
  }

  /**
   * Mark all notifications as read
   */
  @Patch('read-all')
  markAllAsRead(@Body('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  /**
   * Mark single notification as read
   */
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
