'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Mail, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/lib/auth/auth-context'
import { authAPI } from '@/lib/auth/auth-api'
import { useVerificationPolling } from '@/lib/hooks/use-verification-polling';
import { useNotificationManager } from '@/lib/hooks/use-notification-manager';

export interface VerificationStatusIndicatorProps {
    className?: string;
    showActions?: boolean;
    compact?: boolean;
    enablePolling?: boolean;
    onStatusChange?: (status: 'verified' | 'unverified' | 'pending' | 'error') => void;
}

export type VerificationStatus = 'verified' | 'unverified' | 'pending' | 'error';

export function VerificationStatusIndicator({
    className = '',
    showActions = true,
    compact = false,
    onStatusChange,
    enablePolling = true
}: VerificationStatusIndicatorProps) {
    const { user } = useAuthContext();

    const {
        status,
        isLoading,
        lastChecked,
        attemptCount,
        isPolling,
        error,
        checkVerificationStatus,
        startPolling,
        stopPolling,
        pausePolling,
        resumePolling,
        resetPolling
    } = useVerificationPolling({
        enabled: enablePolling,
        interval: 30000, // 30 seconds
        maxAttempts: 20, // 10 minutes
        onStatusChange
    });

    const { addVerificationReminder, addVerificationSuccess, addVerificationError } = useNotificationManager();

    // Manual status check function
    const handleManualCheck = async () => {
        if (!user) return;

        try {
            // This would call the actual API endpoint to check status
            const isVerified = user.is_verified || false;
            onStatusChange?.(isVerified ? 'verified' : 'unverified');

            // Add appropriate notification
            if (isVerified) {
                addVerificationSuccess();
            } else {
                addVerificationReminder('medium');
            }
        } catch (error) {
            console.error('Error checking verification status:', error);
            addVerificationError('Failed to check verification status. Please try again.');
        }
    };

    const handleResendVerification = async () => {
        try {
            // This would call the resend verification endpoint
            await authAPI.resendVerification();
            // Show success notification
            addVerificationReminder('medium');
        } catch (error) {
            console.error('Error resending verification:', error);
            // Show error notification
            addVerificationError('Failed to resend verification email. Please try again.');
        }
    };

    const getStatusConfig = (status: VerificationStatus) => {
        switch (status) {
            case 'verified':
                return {
                    icon: CheckCircle,
                    color: 'text-green-500',
                    bgColor: 'bg-green-500/10',
                    borderColor: 'border-green-500/20',
                    text: 'Email Verified',
                    description: 'Your email has been successfully verified'
                };
            case 'unverified':
                return {
                    icon: XCircle,
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/20',
                    text: 'Email Not Verified',
                    description: 'Please check your email and click the verification link'
                };
            case 'pending':
                return {
                    icon: Clock,
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/20',
                    text: 'Verification Pending',
                    description: 'Verification email sent, please check your inbox'
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-500/10',
                    borderColor: 'border-gray-500/20',
                    text: 'Status Unknown',
                    description: 'Unable to determine verification status'
                };
            default:
                return {
                    icon: AlertCircle,
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-500/10',
                    borderColor: 'border-gray-500/20',
                    text: 'Unknown Status',
                    description: 'Verification status could not be determined'
                };
        }
    };

    const statusConfig = getStatusConfig(status);
    const IconComponent = statusConfig.icon;

    if (isLoading) {
        return (
            <div className={`flex items-center space-x-3 ${className}`}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-blue"></div>
                <span className="text-sm text-gray-500">Checking verification status...</span>
            </div>
        );
    }

    if (compact) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <IconComponent className={`h-4 w-4 ${statusConfig.color}`} />
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.text}
                </span>
                {enablePolling && isPolling && (
                    <div className="w-2 h-2 bg-primary-blue rounded-full animate-pulse"></div>
                )}
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className={`flex items-start space-x-3 p-4 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                <IconComponent className={`h-5 w-5 mt-0.5 ${statusConfig.color}`} />

                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.text}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                        {statusConfig.description}
                    </p>

                    {lastChecked && (
                        <p className="text-xs text-gray-400 mt-2">
                            Last checked: {lastChecked.toLocaleTimeString()}
                        </p>
                    )}

                    {enablePolling && isPolling && (
                        <div className="flex items-center space-x-2 mt-2">
                            <div className="w-2 h-2 bg-primary-blue rounded-full animate-pulse"></div>
                            <span className="text-xs text-primary-blue">
                                Auto-checking every 30s ({attemptCount}/20 attempts)
                            </span>
                        </div>
                    )}

                    {error && (
                        <p className="text-xs text-red-500 mt-2">
                            Error: {error}
                        </p>
                    )}
                </div>

                {showActions && status === 'unverified' && (
                    <div className="flex flex-col space-y-2">
                        <Button
                            size="xs"
                            variant="outline"
                            onClick={handleResendVerification}
                            disabled={isLoading}
                            className="whitespace-nowrap"
                        >
                            <Mail className="h-3 w-3 mr-1" />
                            Resend Email
                        </Button>
                        <Button
                            size="xs"
                            variant="outline"
                            onClick={handleManualCheck}
                            disabled={isLoading}
                            className="whitespace-nowrap"
                        >
                            Refresh Status
                        </Button>

                        {enablePolling && (
                            <div className="flex space-x-1">
                                {isPolling ? (
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={pausePolling}
                                        className="flex-1"
                                    >
                                        <Pause className="h-3 w-3 mr-1" />
                                        Pause
                                    </Button>
                                ) : (
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={resumePolling}
                                        className="flex-1"
                                    >
                                        <Play className="h-3 w-3 mr-1" />
                                        Resume
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {showActions && status === 'verified' && (
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={handleManualCheck}
                        disabled={isLoading}
                        className="whitespace-nowrap"
                    >
                        Refresh Status
                    </Button>
                )}
            </div>
        </div>
    );
}

export default VerificationStatusIndicator;
