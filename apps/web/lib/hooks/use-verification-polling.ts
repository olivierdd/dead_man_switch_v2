'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthContext } from '@/lib/auth/auth-context'
import { authAPI } from '@/lib/auth/auth-api'

export interface UseVerificationPollingOptions {
    enabled?: boolean;
    interval?: number;
    maxAttempts?: number;
    onStatusChange?: (status: 'verified' | 'unverified' | 'pending' | 'error') => void;
}

export interface UseVerificationPollingReturn {
    status: 'verified' | 'unverified' | 'pending' | 'error';
    isLoading: boolean;
    lastChecked: Date | null;
    attemptCount: number;
    isPolling: boolean;
    error: string | null;
    checkVerificationStatus: () => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    pausePolling: () => void;
    resumePolling: () => void;
    resetPolling: () => void;
}

export function useVerificationPolling({
    enabled = true,
    interval = 30000, // 30 seconds default
    maxAttempts = 20,
    onStatusChange
}: UseVerificationPollingOptions = {}): UseVerificationPollingReturn {
    const { user } = useAuthContext();
    const [status, setStatus] = useState<'verified' | 'unverified' | 'pending' | 'error'>('unverified');
    const [isLoading, setIsLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);

    // Determine initial status from user
    useEffect(() => {
        if (user) {
            const newStatus = user.is_verified ? 'verified' : 'unverified';
            setStatus(newStatus);
            onStatusChange?.(newStatus);
        }
    }, [user, onStatusChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Check verification status manually
    const checkVerificationStatus = useCallback(async () => {
        if (!user || !mountedRef.current) return;

        try {
            setIsLoading(true);
            setError(null);

            // Refresh user data to get latest verification status
            // await refreshUser(); // This line was removed as per the edit hint

            const newStatus = user.is_verified ? 'verified' : 'unverified';
            setStatus(newStatus);
            setLastChecked(new Date());
            onStatusChange?.(newStatus);

            // If verified, stop polling
            if (newStatus === 'verified') {
                stopPolling();
            }
        } catch (err) {
            console.error('Error checking verification status:', err);
            setError('Failed to check verification status');
            setStatus('error');
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [user, onStatusChange]);

    // Start polling
    const startPolling = useCallback(() => {
        if (!enabled || isPolling || !mountedRef.current) return;

        setIsPolling(true);
        setAttemptCount(0);
        setIsPaused(false);

        // Initial check
        checkVerificationStatus();

        // Set up interval
        intervalRef.current = setInterval(async () => {
            if (!mountedRef.current || isPaused) return;

            setAttemptCount(prev => {
                const newCount = prev + 1;

                // Stop polling if max attempts reached
                if (newCount >= maxAttempts) {
                    stopPolling();
                    return newCount;
                }

                // Check status
                checkVerificationStatus();
                return newCount;
            });
        }, interval);
    }, [enabled, isPolling, isPaused, maxAttempts, interval, checkVerificationStatus]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
        setIsPaused(false);
    }, []);

    // Pause polling
    const pausePolling = useCallback(() => {
        setIsPaused(true);
    }, []);

    // Resume polling
    const resumePolling = useCallback(() => {
        setIsPaused(false);
    }, []);

    // Reset polling state
    const resetPolling = useCallback(() => {
        stopPolling();
        setAttemptCount(0);
        setError(null);
        setLastChecked(null);
    }, [stopPolling]);

    // Auto-start polling if enabled and user is not verified
    useEffect(() => {
        if (enabled && user && !user.is_verified && !isPolling) {
            startPolling();
        }
    }, [enabled, user, isPolling, startPolling]);

    // Cleanup interval on unmount or when polling stops
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPolling]);

    return {
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
    };
}
