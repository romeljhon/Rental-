
"use client";
import type { Notification } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { getActiveUserId } from '@/lib/auth';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: (userId: string) => number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string, userId: string) => void;
  markAllAsRead: (userId: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const activeUserId = getActiveUserId();

  const fetchNotifications = useCallback(async () => {
    if (!activeUserId) return;
    try {
      const data = await fetchApi(`/notifications/?user_id=${activeUserId}`);
      const mapped: Notification[] = data.map((n: any) => ({
        id: n.id.toString(),
        targetUserId: n.target_user_id,
        eventType: n.event_type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.is_read,
        timestamp: new Date(n.timestamp),
        relatedItemId: n.related_item_id,
        relatedUser: n.related_user_id ? { id: n.related_user_id, name: n.related_user_name || 'User' } : undefined
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [activeUserId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const backendData = {
      target_user_id: notificationData.targetUserId,
      event_type: notificationData.eventType,
      title: notificationData.title,
      message: notificationData.message,
      link: notificationData.link,
      related_item_id: notificationData.relatedItemId,
      related_user_id: notificationData.relatedUser?.id,
      related_user_name: notificationData.relatedUser?.name,
    };

    try {
      await fetchApi('/notifications/', {
        method: 'POST',
        body: JSON.stringify(backendData)
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to add notification:", error);
    }
  };

  const markAsRead = async (notificationId: string, userId: string) => {
    try {
      await fetchApi(`/notifications/${notificationId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_read: true })
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async (userId: string) => {
    // Note: This would typically be a custom action on the backend
    // For now, let's mark them locally or iterate (not ideal for many)
    const unread = notifications.filter(n => n.targetUserId === userId && !n.isRead);
    for (const n of unread) {
      await markAsRead(n.id, userId);
    }
  };

  const getNotificationsForUser = (userId: string): Notification[] => {
    return notifications.filter(n => n.targetUserId === userId);
  };

  const unreadCount = (userId: string): number => {
    return notifications.filter(n => n.targetUserId === userId && !n.isRead).length;
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, getNotificationsForUser }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
