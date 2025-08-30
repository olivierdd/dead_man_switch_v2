/**
 * Session Timer Component
 * Shows countdown to token expiration with visual indicators
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/lib/auth'
import { TokenManager } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
    Clock,
    AlertTriangle,
    RefreshCw,
    CheckCircle,
    Pause,
    Play
} from 'lucide-react'

export interface SessionTimerProps {
    className?: string
    showWarning?: boolean
    onRefresh?: () => void
    compact?: boolean
}

export interface SessionTimerState {
    timeRemaining: number | null
    isExpired: boolean
    isWarning: boolean
    isCritical: boolean
    percentage: number
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
    className = '',
    showWarning = true,
    onRefresh,
    compact = false
}) => {
    const { isAuthenticated, user } = useAuthContext()
    const [timerState, setTimerState] = useState<SessionTimerState>({
        timeRemaining: null,
        isExpired: false,
        isWarning: false,
        isCritical: false,
        percentage: 100
    })
    const [isPaused, setIsPaused] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setTimerState({
                timeRemaining: null,
                isExpired: true,
                isWarning: false,
                isCritical: false,
                percentage: 0
            })
            return
        }

        const updateTimer = () => {
            if (isPaused) return

            const timeUntilExpiry = TokenManager.getTimeUntilExpiry()

            if (timeUntilExpiry === null) {
                setTimerState({
                    timeRemaining: null,
                    isExpired: true,
                    isWarning: false,
                    isCritical: false,
                    percentage: 0
                })
                return
            }

            // Calculate percentage (assuming 30-minute token lifetime)
            const totalLifetime = 30 * 60 * 1000 // 30 minutes in milliseconds
            const percentage = Math.max(0, (timeUntilExpiry / totalLifetime) * 100)

            // Determine states
            const isExpired = timeUntilExpiry <= 0
            const isWarning = timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0 // 5 minutes or less
            const isCritical = timeUntilExpiry <= 1 * 60 * 1000 && timeUntilExpiry > 0 // 1 minute or less

            setTimerState({
                timeRemaining: timeUntilExpiry,
                isExpired,
                isWarning,
                isCritical,
                percentage
            })
        }

        // Update immediately
        updateTimer()

        // Update every second
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [isAuthenticated, user, isPaused])

    const formatTime = (milliseconds: number | null) => {
        if (!milliseconds || milliseconds <= 0) return '00:00'

        const minutes = Math.floor(milliseconds / (1000 * 60))
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const getTimerColor = () => {
        if (timerState.isExpired) return 'text-red-400'
        if (timerState.isCritical) return 'text-red-500'
        if (timerState.isWarning) return 'text-yellow-400'
        return 'text-green-400'
    }

    const getTimerIcon = () => {
        if (timerState.isExpired) return <AlertTriangle className="w-4 h-4" />
        if (timerState.isCritical) return <AlertTriangle className="w-4 h-4" />
        if (timerState.isWarning) return <Clock className="w-4 h-4" />
        return <CheckCircle className="w-4 h-4" />
    }

    const getProgressColor = () => {
        if (timerState.isExpired) return 'bg-red-500'
        if (timerState.isCritical) return 'bg-red-500'
        if (timerState.isWarning) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const togglePause = () => {
        setIsPaused(!isPaused)
    }

    if (!isAuthenticated) {
        return null
    }

    if (compact) {
        return (
            <div className={`relative ${className}`}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    {getTimerIcon()}
                </Button>

                {/* Compact Tooltip */}
                {showTooltip && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                        <div className="flex items-center space-x-2 mb-2">
                            {getTimerIcon()}
                            <span className={getTimerColor()}>
                                {timerState.isExpired ? 'Expired' : formatTime(timerState.timeRemaining)}
                            </span>
                        </div>
                        <div className="text-xs text-gray-300">
                            {timerState.isExpired ? 'Session expired' : 'Time remaining'}
                        </div>
                        <div className="absolute top-full right-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center space-x-3">
                {/* Timer Display */}
                <div className="flex items-center space-x-2">
                    {getTimerIcon()}
                    <span className={`text-sm font-mono ${getTimerColor()}`}>
                        {formatTime(timerState.timeRemaining)}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out ${getProgressColor()}`}
                        style={{ width: `${timerState.percentage}%` }}
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePause}
                        className="p-1 text-gray-400 hover:text-white"
                        title={isPaused ? 'Resume timer' : 'Pause timer'}
                    >
                        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    </Button>

                    {onRefresh && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            className="p-1 text-gray-400 hover:text-white"
                            title="Refresh session"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Warning Message */}
            {showWarning && (timerState.isWarning || timerState.isCritical) && (
                <div className={`
                    mt-2 p-2 rounded-lg text-sm
                    ${timerState.isCritical
                        ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                        : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                    }
                `}>
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                            {timerState.isCritical
                                ? 'Session expires soon! Please refresh to continue.'
                                : 'Session will expire soon. Consider refreshing.'
                            }
                        </span>
                    </div>

                    {onRefresh && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            className={`
                                mt-2 text-xs
                                ${timerState.isCritical
                                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                                    : 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
                                }
                            `}
                        >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Refresh Now
                        </Button>
                    )}
                </div>
            )}

            {/* Expired Message */}
            {timerState.isExpired && (
                <div className="mt-2 p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Session has expired. Please log in again.</span>
                    </div>
                </div>
            )}
        </div>
    )
}
