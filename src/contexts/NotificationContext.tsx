
"use client";
import type { Notification } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: (userId: string) => number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string, userId: string) => void;
  markAllAsRead: (userId: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = 'rentaleaseNotifications';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifications) {
        try {
          const parsedNotifications = JSON.parse(storedNotifications).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp) // Ensure timestamp is a Date object
          }));
          setNotifications(parsedNotifications);
        } catch (error) {
          console.error("Error parsing notifications from localStorage", error);
          localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY); // Clear corrupted data
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50 notifications
  };

  const markAsRead = (notificationId: string, userId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId && n.targetUserId === userId ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = (userId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.targetUserId === userId ? { ...n, isRead: true } : n))
    );
  };

  const getNotificationsForUser = (userId: string): Notification[] => {
    return notifications
      .filter(n => n.targetUserId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
