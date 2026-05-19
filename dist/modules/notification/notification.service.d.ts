import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationService {
    private prisma;
    private notificationSubject;
    constructor(prisma: PrismaService);
    getNotificationStream(userId: string): Observable<any>;
    createNotification(userId: string, title: string, message: string): Promise<any>;
    getNotifications(userId: string): Promise<any>;
    markAsRead(id: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
}
