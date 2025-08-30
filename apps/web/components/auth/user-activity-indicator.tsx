/**
 * User Activity Indicator Component
 * Shows user activity status, online presence, and recent activity
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
    User,
    Activity,
    Clock,
    Wifi,
    WifiOff,
    Eye,
    EyeOff,
    Circle,
    CheckCircle,
    AlertCircle
} from 'lucide-react'

export interface UserActivityIndicatorProps {
    className?: string
    showDetails?: boolean
    compact?: boolean
    showPresence?: boolean
}

export interface UserActivityState {
    isOnline: boolean
    lastActivity: number | null
    activityLevel: 'active' | 'idle' | 'away' | 'offline'
    idleTime: number
    presenceStatus: 'online' | 'away' | 'busy' | 'offline'
    recentActions: string[]
}

export const UserActivityIndicator: React.FC<UserActivityIndicatorProps> = ({
    className = '',
    showDetails = false,
    compact = false,
    showPresence = true
}) => {
    const { user, isAuthenticated } = useAuthContext()
    const [activityState, setActivityState] = useState<UserActivityState>({
        isOnline: navigator.onLine,
        lastActivity: Date.now(),
        activityLevel: 'active',
        idleTime: 0,
        presenceStatus: 'online',
        recentActions: []
    })
    const [showTooltip, setShowTooltip] = useState(false)
    const [isVisible, setIsVisible] = useState(true)

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => {
            setActivityState(prev => ({
                ...prev,
                isOnline: true,
                presenceStatus: 'online',
                activityLevel: 'active'
            }))
        }

        const handleOffline = () => {
            setActivityState(prev => ({
                ...prev,
                isOnline: false,
                presenceStatus: 'offline',
                activityLevel: 'offline'
            }))
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Monitor user activity
    useEffect(() => {
        let idleTimer: NodeJS.Timeout
        let activityTimer: NodeJS.Timeout

        const updateActivity = () => {
            const now = Date.now()
            setActivityState(prev => {
                const newActivityLevel = 'active'
                const newIdleTime = 0

                // Update recent actions (keep last 5)
                const newRecentActions = [
                    'User activity detected',
                    ...prev.recentActions.slice(0, 4)
                ]

                return {
                    ...prev,
                    lastActivity: now,
                    activityLevel: newActivityLevel,
                    idleTime: newIdleTime,
                    recentActions: newRecentActions
                }
            })

            // Reset idle timer
            clearTimeout(idleTimer)
            idleTimer = setTimeout(() => {
                setActivityState(prev => ({ ...prev, activityLevel: 'idle' }))
            }, 5 * 60 * 1000) // 5 minutes
        }

        // Monitor various user activities
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
        events.forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true })
        })

        // Update activity every minute
        activityTimer = setInterval(() => {
            const now = Date.now()
            setActivityState(prev => {
                if (prev.lastActivity) {
                    const idleTime = now - prev.lastActivity
                    let newActivityLevel = prev.activityLevel

                    if (idleTime > 10 * 60 * 1000) { // 10 minutes
                        newActivityLevel = 'away'
                    } else if (idleTime > 5 * 60 * 1000) { // 5 minutes
                        newActivityLevel = 'idle'
                    } else {
                        newActivityLevel = 'active'
                    }

                    return {
                        ...prev,
                        idleTime,
                        activityLevel: newActivityLevel
                    }
                }
                return prev
            })
        }, 60000) // Every minute

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, updateActivity)
            })
            clearTimeout(idleTimer)
            clearInterval(activityTimer)
        }
    }, [])

    // Monitor page visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isPageVisible = !document.hidden
            setIsVisible(isPageVisible)

            if (isPageVisible) {
                setActivityState(prev => ({
                    ...prev,
                    activityLevel: 'active',
                    presenceStatus: 'online'
                }))
            } else {
                setActivityState(prev => ({
                    ...prev,
                    presenceStatus: 'away'
                }))
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    const getActivityIcon = () => {
        switch (activityState.activityLevel) {
            case 'active':
                return <Activity className="w-4 h-4 text-green-400" />
            case 'idle':
                return <Clock className="w-4 h-4 text-yellow-400" />
            case 'away':
                return <EyeOff className="w-4 h-4 text-orange-400" />
            case 'offline':
                return <WifiOff className="w-4 h-4 text-red-400" />
            default:
                return <User className="w-4 h-4 text-gray-400" />
        }
    }

    const getPresenceIcon = () => {
        switch (activityState.presenceStatus) {
            case 'online':
                return <Circle className="w-3 h-3 text-green-400 fill-current" />
            case 'away':
                return <Circle className="w-3 h-3 text-yellow-400 fill-current" />
            case 'busy':
                return <Circle className="w-3 h-3 text-red-400 fill-current" />
            case 'offline':
                return <Circle className="w-3 h-3 text-gray-400" />
            default:
                return <Circle className="w-3 h-3 text-gray-400" />
        }
    }

    const getActivityColor = () => {
        switch (activityState.activityLevel) {
            case 'active':
                return 'text-green-400'
            case 'idle':
                return 'text-yellow-400'
            case 'away':
                return 'text-orange-400'
            case 'offline':
                return 'text-red-400'
            default:
                return 'text-gray-400'
        }
    }

    const formatIdleTime = (milliseconds: number) => {
        if (milliseconds < 60000) return 'Just now'

        const minutes = Math.floor(milliseconds / 60000)
        const hours = Math.floor(minutes / 60)

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ago`
        }
        return `${minutes}m ago`
    }

    if (!isAuthenticated || !user) {
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
                    {getActivityIcon()}
                </Button>

                {/* Compact Tooltip */}
                {showTooltip && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                        <div className="flex items-center space-x-2 mb-2">
                            {getActivityIcon()}
                            <span className="capitalize">{activityState.activityLevel}</span>
                        </div>
                        <div className="text-xs text-gray-300">
                            {activityState.lastActivity
                                ? `Last activity: ${formatIdleTime(Date.now() - activityState.lastActivity)}`
                                : 'No recent activity'
                            }
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
                {/* Activity Icon */}
                <div className="flex items-center space-x-2">
                    {getActivityIcon()}
                    <span className={`text-sm capitalize ${getActivityColor()}`}>
                        {activityState.activityLevel}
                    </span>
                </div>

                {/* Presence Indicator */}
                {showPresence && (
                    <div className="flex items-center space-x-2">
                        {getPresenceIcon()}
                        <span className="text-xs text-gray-400 capitalize">
                            {activityState.presenceStatus}
                        </span>
                    </div>
                )}

                {/* Last Activity */}
                <div className="text-xs text-gray-400">
                    {activityState.lastActivity
                        ? `Last: ${formatIdleTime(Date.now() - activityState.lastActivity)}`
                        : 'No activity'
                    }
                </div>
            </div>

            {/* Detailed Tooltip */}
            {showTooltip && showDetails && (
                <div className="absolute bottom-full right-0 mb-2 w-80 bg-gray-800 text-white text-sm rounded-lg shadow-lg border border-white/10 z-50">
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">User Activity</h3>
                            <div className="flex items-center space-x-2">
                                {activityState.isOnline ? (
                                    <Wifi className="w-4 h-4 text-green-400" />
                                ) : (
                                    <WifiOff className="w-4 h-4 text-red-400" />
                                )}
                                <span className="text-xs text-gray-400">
                                    {activityState.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {/* Activity Status */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Status:</span>
                                <div className="flex items-center space-x-2">
                                    {getActivityIcon()}
                                    <span className={`capitalize ${getActivityColor()}`}>
                                        {activityState.activityLevel}
                                    </span>
                                </div>
                            </div>

                            {/* Presence */}
                            {showPresence && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Presence:</span>
                                    <div className="flex items-center space-x-2">
                                        {getPresenceIcon()}
                                        <span className="text-gray-400 capitalize">
                                            {activityState.presenceStatus}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Last Activity */}
                            {activityState.lastActivity && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Last activity:</span>
                                    <span className="text-gray-400">
                                        {formatIdleTime(Date.now() - activityState.lastActivity)}
                                    </span>
                                </div>
                            )}

                            {/* Page Visibility */}
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Page visible:</span>
                                <div className="flex items-center space-x-2">
                                    {isVisible ? (
                                        <Eye className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-red-400" />
                                    )}
                                    <span className="text-gray-400">
                                        {isVisible ? 'Visible' : 'Hidden'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Actions */}
                        {activityState.recentActions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/10">
                                <h4 className="text-xs font-medium text-gray-300 mb-2">Recent Activity</h4>
                                <div className="space-y-1">
                                    {activityState.recentActions.slice(0, 3).map((action, index) => (
                                        <div key={index} className="text-xs text-gray-400 flex items-center space-x-2">
                                            <CheckCircle className="w-3 h-3 text-green-400" />
                                            <span>{action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tooltip Arrow */}
                    <div className="absolute top-full right-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
            )}
        </div>
    )
}
