/**
 * Authentication Status Indicator Component
 * Shows real-time authentication status, token health, and session information
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/lib/auth'
import { TokenManager } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    User,
    Wifi,
    WifiOff,
    Battery,
    BatteryWarning,
    BatteryCharging
} from 'lucide-react'

export interface AuthStatusIndicatorProps {
    className?: string
    showDetails?: boolean
    compact?: boolean
    onRefresh?: () => void
}

export interface AuthStatus {
    isAuthenticated: boolean
    tokenHealth: 'excellent' | 'good' | 'warning' | 'critical' | 'expired'
    timeUntilExpiry: number | null
    sessionAge: number | null
    lastActivity: number | null
    isOnline: boolean
    refreshInProgress: boolean
}

export const AuthStatusIndicator: React.FC<AuthStatusIndicatorProps> = ({
    className = '',
    showDetails = false,
    compact = false,
    onRefresh
}) => {
    const { user, isAuthenticated, isInitialized } = useAuthContext()
    const [status, setStatus] = useState<AuthStatus>({
        isAuthenticated: false,
        tokenHealth: 'expired',
        timeUntilExpiry: null,
        sessionAge: null,
        lastActivity: null,
        isOnline: navigator.onLine,
        refreshInProgress: false
    })
    const [showTooltip, setShowTooltip] = useState(false)

    // Update status periodically
    useEffect(() => {
        const updateStatus = () => {
            if (!isAuthenticated || !user) {
                setStatus(prev => ({
                    ...prev,
                    isAuthenticated: false,
                    tokenHealth: 'expired',
                    timeUntilExpiry: null,
                    sessionAge: null
                }))
                return
            }

            // Check token health
            const timeUntilExpiry = TokenManager.getTimeUntilExpiry()
            const tokenExpiry = TokenManager.getTokenExpiry()
            const issuedAt = TokenManager.getTokenExpiry() // This should be issuedAt, but we'll use expiry for now

            let tokenHealth: AuthStatus['tokenHealth'] = 'excellent'
            let sessionAge: number | null = null

            if (timeUntilExpiry !== null) {
                if (timeUntilExpiry > 25 * 60 * 1000) { // More than 25 minutes
                    tokenHealth = 'excellent'
                } else if (timeUntilExpiry > 15 * 60 * 1000) { // More than 15 minutes
                    tokenHealth = 'good'
                } else if (timeUntilExpiry > 5 * 60 * 1000) { // More than 5 minutes
                    tokenHealth = 'warning'
                } else if (timeUntilExpiry > 0) { // Less than 5 minutes but not expired
                    tokenHealth = 'critical'
                } else {
                    tokenHealth = 'expired'
                }

                // Calculate session age
                if (issuedAt) {
                    sessionAge = Date.now() - (issuedAt * 1000)
                }
            }

            setStatus(prev => ({
                ...prev,
                isAuthenticated: true,
                tokenHealth,
                timeUntilExpiry,
                sessionAge
            }))
        }

        // Update immediately
        updateStatus()

        // Update every 30 seconds
        const interval = setInterval(updateStatus, 30000)

        return () => clearInterval(interval)
    }, [isAuthenticated, user])

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }))
        const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }))

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Monitor user activity
    useEffect(() => {
        const updateLastActivity = () => {
            setStatus(prev => ({ ...prev, lastActivity: Date.now() }))
        }

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
        events.forEach(event => {
            document.addEventListener(event, updateLastActivity, { passive: true })
        })

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, updateLastActivity)
            })
        }
    }, [])

    const getStatusColor = (health: AuthStatus['tokenHealth']) => {
        switch (health) {
            case 'excellent': return 'text-green-400'
            case 'good': return 'text-blue-400'
            case 'warning': return 'text-yellow-400'
            case 'critical': return 'text-orange-400'
            case 'expired': return 'text-red-400'
            default: return 'text-gray-400'
        }
    }

    const getStatusIcon = (health: AuthStatus['tokenHealth']) => {
        switch (health) {
            case 'excellent':
            case 'good':
                return <CheckCircle className="w-4 h-4" />
            case 'warning':
                return <Clock className="w-4 h-4" />
            case 'critical':
                return <BatteryWarning className="w-4 h-4" />
            case 'expired':
                return <AlertTriangle className="w-4 h-4" />
            default:
                return <Shield className="w-4 h-4" />
        }
    }

    const getBatteryIcon = (health: AuthStatus['tokenHealth']) => {
        switch (health) {
            case 'excellent':
                return <BatteryCharging className="w-4 h-4 text-green-400" />
            case 'good':
                return <Battery className="w-4 h-4 text-blue-400" />
            case 'warning':
                return <Battery className="w-4 h-4 text-yellow-400" />
            case 'critical':
                return <BatteryWarning className="w-4 h-4 text-orange-400" />
            case 'expired':
                return <Battery className="w-4 h-4 text-red-400" />
            default:
                return <Battery className="w-4 h-4 text-gray-400" />
        }
    }

    const formatTime = (milliseconds: number | null) => {
        if (!milliseconds) return 'Unknown'

        const minutes = Math.floor(milliseconds / (1000 * 60))
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

        if (minutes > 0) {
            return `${minutes}m ${seconds}s`
        }
        return `${seconds}s`
    }

    const formatDuration = (milliseconds: number | null) => {
        if (!milliseconds) return 'Unknown'

        const hours = Math.floor(milliseconds / (1000 * 60 * 60))
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    if (!isInitialized) {
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
                    {getBatteryIcon(status.tokenHealth)}
                </Button>

                {/* Compact Tooltip */}
                {showTooltip && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                        <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(status.tokenHealth)}
                            <span className="capitalize">{status.tokenHealth}</span>
                        </div>
                        {status.timeUntilExpiry !== null && (
                            <div className="text-xs text-gray-300">
                                Expires in: {formatTime(status.timeUntilExpiry)}
                            </div>
                        )}
                        <div className="absolute top-full right-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={`relative ${className}`}>
            <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/5"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {getBatteryIcon(status.tokenHealth)}
                {!compact && (
                    <span className="text-xs capitalize">{status.tokenHealth}</span>
                )}
            </Button>

            {/* Detailed Tooltip */}
            {showTooltip && showDetails && (
                <div className="absolute bottom-full right-0 mb-2 w-80 bg-gray-800 text-white text-sm rounded-lg shadow-lg border border-white/10 z-50">
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">Authentication Status</h3>
                            <div className="flex items-center space-x-2">
                                {status.isOnline ? (
                                    <Wifi className="w-4 h-4 text-green-400" />
                                ) : (
                                    <WifiOff className="w-4 h-4 text-red-400" />
                                )}
                                <span className="text-xs text-gray-400">
                                    {status.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {/* Token Health */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Token Health:</span>
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(status.tokenHealth)}
                                    <span className={`capitalize ${getStatusColor(status.tokenHealth)}`}>
                                        {status.tokenHealth}
                                    </span>
                                </div>
                            </div>

                            {/* Time Until Expiry */}
                            {status.timeUntilExpiry !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Expires in:</span>
                                    <span className={getStatusColor(status.tokenHealth)}>
                                        {formatTime(status.timeUntilExpiry)}
                                    </span>
                                </div>
                            )}

                            {/* Session Age */}
                            {status.sessionAge !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Session age:</span>
                                    <span className="text-gray-400">
                                        {formatDuration(status.sessionAge)}
                                    </span>
                                </div>
                            )}

                            {/* Last Activity */}
                            {status.lastActivity !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Last activity:</span>
                                    <span className="text-gray-400">
                                        {formatTime(Date.now() - status.lastActivity)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    User: {user?.display_name || user?.email || 'Unknown'}
                                </span>

                                {onRefresh && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onRefresh}
                                        disabled={status.refreshInProgress}
                                        className="text-xs"
                                    >
                                        <RefreshCw className={`w-3 h-3 mr-1 ${status.refreshInProgress ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tooltip Arrow */}
                    <div className="absolute top-full right-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
            )}
        </div>
    )
}
