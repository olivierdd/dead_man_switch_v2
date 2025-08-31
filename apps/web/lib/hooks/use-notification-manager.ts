'use client';

import { useCallback } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    timestamp: Date;
    duration?: number; // in milliseconds, undefined means manual dismiss
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface UseNotificationManagerReturn {
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
    addVerificationReminder: (priority?: NotificationPriority) => string;
    addVerificationSuccess: () => string;
    addVerificationError: (message?: string) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    getNotifications: () => Notification[];
}

export function useNotificationManager(): UseNotificationManagerReturn {
    // For now, this is a simple implementation that logs to console
    // In a real app, this would integrate with a notification system like react-hot-toast or similar

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>): string => {
        const id = Math.random().toString(36).substr(2, 9);
        const fullNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date()
        };

        // Log to console for now
        console.log('Notification:', fullNotification);

        // In a real implementation, you would:
        // 1. Add to notification state/store
        // 2. Show toast/notification UI
        // 3. Handle auto-dismiss if duration is set

        return id;
    }, []);

    const addVerificationReminder = useCallback((priority: NotificationPriority = 'medium'): string => {
        return addNotification({
            type: 'info',
            title: 'Email Verification Required',
            message: 'Please check your email and click the verification link to complete your account setup.',
            priority,
            duration: 10000 // 10 seconds
        });
    }, [addNotification]);

    const addVerificationSuccess = useCallback((): string => {
        return addNotification({
            type: 'success',
            title: 'Email Verified!',
            message: 'Your email has been successfully verified. You now have access to all features.',
            priority: 'high',
            duration: 5000 // 5 seconds
        });
    }, [addNotification]);

    const addVerificationError = useCallback((message: string = 'Verification failed. Please try again.'): string => {
        return addNotification({
            type: 'error',
            title: 'Verification Error',
            message,
            priority: 'high',
            duration: 8000 // 8 seconds
        });
    }, [addNotification]);

    const removeNotification = useCallback((id: string): void => {
        // In a real implementation, remove from notification state/store
        console.log('Remove notification:', id);
    }, []);

    const clearNotifications = useCallback((): void => {
        // In a real implementation, clear all notifications
        console.log('Clear all notifications');
    }, []);

    const getNotifications = useCallback((): Notification[] => {
        // In a real implementation, return notifications from state/store
        return [];
    }, []);

    return {
        addNotification,
        addVerificationReminder,
        addVerificationSuccess,
        addVerificationError,
        removeNotification,
        clearNotifications,
        getNotifications
    };
}
