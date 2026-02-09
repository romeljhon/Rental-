/**
 * Notifications Service
 * Handles notification operations
 */

import { apiClient } from '@/lib/api-client';
import type { Notification } from '@/types';

interface CreateNotificationData {
    target_user_id: string;
    event_type: string;
    title: string;
    message: string;
    link?: string;
    related_item_id?: string;
    related_user_id?: string;
    related_user_name?: string;
}

export const notificationsService = {
    /**
     * Get notifications for a user
     */
    async getForUser(userId: string): Promise<Notification[]> {
        return apiClient.get<Notification[]>('/notifications/', { user_id: userId });
    },

    /**
     * Get unread count for user
     */
    async getUnreadCount(userId: string): Promise<number> {
        const notifications = await this.getForUser(userId);
        return notifications.filter(n => !n.isRead).length;
    },

    /**
     * Mark notification as read
     */
    async markAsRead(id: string): Promise<Notification> {
        return apiClient.patch<Notification>(`/notifications/${id}/`, { is_read: true });
    },

    /**
     * Mark all notifications as read for user
     */
    async markAllAsRead(userId: string): Promise<void> {
        const notifications = await this.getForUser(userId);
        const unread = notifications.filter(n => !n.isRead);

        await Promise.all(
            unread.map(notification => this.markAsRead(notification.id))
        );
    },

    /**
     * Create a new notification
     */
    async create(data: CreateNotificationData): Promise<Notification> {
        return apiClient.post<Notification>('/notifications/', data);
    },

    /**
     * Delete notification
     */
    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/notifications/${id}/`);
    },
};
