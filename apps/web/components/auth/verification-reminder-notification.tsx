'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Mail, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/lib/auth/auth-context'
import { authAPI } from '@/lib/auth/auth-api'
import { useVerificationPolling } from '@/lib/hooks/use-verification-polling';

export interface VerificationReminderNotificationProps {
    className?: string;
    variant?: 'banner' | 'toast' | 'inline';
    showDismiss?: boolean;
    onDismiss?: () => void;
    onAction?: (action: 'resend' | 'check' | 'remind') => void;
}

export type NotificationVariant = 'banner' | 'toast' | 'inline';

export function VerificationReminderNotification({
    className = '',
    variant = 'banner',
    showDismiss = true,
    onDismiss,
    onAction
}: VerificationReminderNotificationProps) {
    const { user } = useAuthContext();
    const [isVisible, setIsVisible] = useState(true);
    const [lastReminder, setLastReminder] = useState<Date | null>(null);
    const [reminderCount, setReminderCount] = useState(0);

    const {
        status,
        isPolling,
        attemptCount,
        startPolling,
        stopPolling
    } = useVerificationPolling({
        enabled: true,
        interval: 60000, // 1 minute for reminders
        maxAttempts: 30, // 30 minutes of reminders
        onStatusChange: (newStatus) => {
            if (newStatus === 'verified') {
                setIsVisible(false);
                onAction?.('check');
            }
        }
    });

    // Show reminder based on different conditions
    const shouldShowReminder = () => {
        if (!user || user.is_verified) return false;

        // Show reminder if:
        // 1. User just registered (first 5 minutes)
        // 2. User hasn't verified after 1 hour
        // 3. User hasn't verified after 24 hours
        // 4. User hasn't verified after 7 days

        const now = new Date();
        const userCreated = new Date(user.created_at || now);
        const timeSinceCreation = now.getTime() - userCreated.getTime();

        const fiveMinutes = 5 * 60 * 1000;
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * 60 * 60 * 1000;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (timeSinceCreation < fiveMinutes) return true;
        if (timeSinceCreation > oneHour && reminderCount === 0) return true;
        if (timeSinceCreation > oneDay && reminderCount === 1) return true;
        if (timeSinceCreation > sevenDays && reminderCount === 2) return true;

        return false;
    };

    useEffect(() => {
        if (shouldShowReminder()) {
            setIsVisible(true);
            setLastReminder(new Date());
            setReminderCount(prev => prev + 1);
        }
    }, [user, status]);

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    const handleResendVerification = () => {
        onAction?.('resend');
        // Start polling to check if verification was completed
        startPolling();
    };

    const handleCheckStatus = () => {
        onAction?.('check');
    };

    const handleRemindLater = () => {
        setIsVisible(false);
        // Set a timer to show again in 1 hour
        setTimeout(() => {
            setIsVisible(true);
        }, 60 * 60 * 1000);
    };

    if (!isVisible || !shouldShowReminder()) {
        return null;
    }

    const getNotificationContent = () => {
        const now = new Date();
        const userCreated = new Date(user?.created_at || now);
        const timeSinceCreation = now.getTime() - userCreated.getTime();

        const fiveMinutes = 5 * 60 * 1000;
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * 60 * 60 * 1000;

        if (timeSinceCreation < fiveMinutes) {
            return {
                icon: Mail,
                title: 'Welcome! Please verify your email',
                message: 'We\'ve sent you a verification email. Please check your inbox and click the verification link to get started.',
                variant: 'info' as const,
                primaryAction: 'Resend Email',
                secondaryAction: 'Check Status'
            };
        } else if (timeSinceCreation > oneHour && reminderCount === 0) {
            return {
                icon: Clock,
                title: 'Email verification pending',
                message: 'It\'s been over an hour since you registered. Please verify your email to access all features.',
                variant: 'warning' as const,
                primaryAction: 'Resend Email',
                secondaryAction: 'Remind Later'
            };
        } else if (timeSinceCreation > oneDay && reminderCount === 1) {
            return {
                icon: AlertTriangle,
                title: 'Email verification required',
                message: 'Your account is still pending verification. Please check your email and verify your account to continue.',
                variant: 'warning' as const,
                primaryAction: 'Resend Email',
                secondaryAction: 'Check Status'
            };
        } else if (timeSinceCreation > 7 * 24 * 60 * 60 * 1000 && reminderCount === 2) {
            return {
                icon: AlertTriangle,
                title: 'Account verification overdue',
                message: 'Your account has been pending verification for over a week. Please verify your email to maintain access.',
                variant: 'error' as const,
                primaryAction: 'Resend Email',
                secondaryAction: 'Check Status'
            };
        }

        return {
            icon: Bell,
            title: 'Verification reminder',
            message: 'Please verify your email address to access all platform features.',
            variant: 'info' as const,
            primaryAction: 'Resend Email',
            secondaryAction: 'Check Status'
        };
    };

    const content = getNotificationContent();
    const IconComponent = content.icon;

    const getVariantStyles = (variant: string) => {
        switch (variant) {
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getIconColor = (variant: string) => {
        switch (variant) {
            case 'info':
                return 'text-blue-500';
            case 'warning':
                return 'text-yellow-500';
            case 'error':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    if (variant === 'toast') {
        return (
            <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
                <div className={`rounded-lg border p-4 shadow-lg ${getVariantStyles(content.variant)}`}>
                    <div className="flex items-start space-x-3">
                        <IconComponent className={`h-5 w-5 mt-0.5 ${getIconColor(content.variant)}`} />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium">{content.title}</h4>
                            <p className="text-sm mt-1 opacity-90">{content.message}</p>

                            <div className="flex space-x-2 mt-3">
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={handleResendVerification}
                                    className="text-xs"
                                >
                                    {content.primaryAction}
                                </Button>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={handleCheckStatus}
                                    className="text-xs"
                                >
                                    {content.secondaryAction}
                                </Button>
                            </div>
                        </div>

                        {showDismiss && (
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={handleDismiss}
                                className="text-xs opacity-60 hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className={`rounded-lg border p-3 ${getVariantStyles(content.variant)} ${className}`}>
                <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${getIconColor(content.variant)}`} />
                    <span className="text-sm font-medium">{content.title}</span>
                    <span className="text-sm opacity-80">-</span>
                    <span className="text-sm opacity-80">{content.message}</span>

                    <div className="flex space-x-2 ml-auto">
                        <Button
                            size="xs"
                            variant="outline"
                            onClick={handleResendVerification}
                            className="text-xs"
                        >
                            {content.primaryAction}
                        </Button>
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={handleCheckStatus}
                            className="text-xs"
                        >
                            {content.secondaryAction}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Default banner variant
    return (
        <div className={`w-full ${className}`}>
            <div className={`rounded-lg border p-4 ${getVariantStyles(content.variant)}`}>
                <div className="flex items-start space-x-3">
                    <IconComponent className={`h-5 w-5 mt-0.5 ${getIconColor(content.variant)}`} />

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{content.title}</h4>
                        <p className="text-sm mt-1 opacity-90">{content.message}</p>

                        {lastReminder && (
                            <p className="text-xs opacity-70 mt-2">
                                Last reminder: {lastReminder.toLocaleTimeString()}
                            </p>
                        )}

                        {isPolling && (
                            <div className="flex items-center space-x-2 mt-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-blue-600">
                                    Checking verification status... ({attemptCount}/30)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={handleResendVerification}
                                className="text-xs"
                            >
                                {content.primaryAction}
                            </Button>
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={handleCheckStatus}
                                className="text-xs"
                            >
                                {content.secondaryAction}
                            </Button>
                        </div>

                        {showDismiss && (
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={handleDismiss}
                                className="text-xs opacity-60 hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerificationReminderNotification;
