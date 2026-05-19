import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    streamNotifications(userId: string): Observable<MessageEvent>;
    getNotifications(userId: string): Promise<any>;
    createNotification(userId: string, title: string, message: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
    markAsRead(id: string): Promise<any>;
}
