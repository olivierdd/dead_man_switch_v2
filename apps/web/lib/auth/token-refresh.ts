/**
 * Token Refresh Service
 * Handles automatic token refresh and manages refresh lifecycle
 */

import React from 'react'
import { TokenManager } from './token-manager'
import { authAPI } from './auth-api'

export interface RefreshResult {
    success: boolean
    newAccessToken?: string
    newRefreshToken?: string
    error?: string
}

export class TokenRefreshService {
    private static isRefreshing = false
    private static refreshPromise: Promise<RefreshResult> | null = null
    private static refreshSubscribers: Array<(result: RefreshResult) => void> = []

    /**
     * Attempt to refresh the access token
     */
    static async refreshToken(): Promise<RefreshResult> {
        try {
            // If already refreshing, return the existing promise
            if (this.isRefreshing && this.refreshPromise) {
                return this.refreshPromise
            }

            // Check if we have a valid refresh token
            const refreshToken = TokenManager.getRefreshToken()
            if (!refreshToken) {
                return {
                    success: false,
                    error: 'No refresh token available'
                }
            }

            // Set refreshing state
            this.isRefreshing = true

            // Create refresh promise
            this.refreshPromise = this.performRefresh(refreshToken)

            // Wait for refresh to complete
            const result = await this.refreshPromise

            // Notify subscribers
            this.notifySubscribers(result)

            return result

        } catch (error) {
            const result: RefreshResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Token refresh failed'
            }

            // Notify subscribers
            this.notifySubscribers(result)

            return result

        } finally {
            // Reset state
            this.isRefreshing = false
            this.refreshPromise = null
        }
    }

    /**
     * Perform the actual token refresh
     */
    private static async performRefresh(refreshToken: string): Promise<RefreshResult> {
        try {
            // Call the refresh endpoint
            const response = await authAPI.refreshToken()

            if (response && response.access_token) {
                // Store the new tokens
                TokenManager.storeTokens(response.access_token, refreshToken)

                return {
                    success: true,
                    newAccessToken: response.access_token,
                    newRefreshToken: refreshToken
                }
            } else {
                return {
                    success: false,
                    error: 'Invalid refresh response'
                }
            }

        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 401) {
                // Refresh token is invalid, clear all tokens
                TokenManager.clearTokens()
                return {
                    success: false,
                    error: 'Refresh token expired'
                }
            }

            return {
                success: false,
                error: error.response?.data?.detail || error.message || 'Refresh failed'
            }
        }
    }

    /**
     * Subscribe to refresh events
     */
    static subscribeToRefresh(callback: (result: RefreshResult) => void): () => void {
        this.refreshSubscribers.push(callback)

        // Return unsubscribe function
        return () => {
            const index = this.refreshSubscribers.indexOf(callback)
            if (index > -1) {
                this.refreshSubscribers.splice(index, 1)
            }
        }
    }

    /**
     * Notify all subscribers of refresh result
     */
    private static notifySubscribers(result: RefreshResult): void {
        this.refreshSubscribers.forEach(callback => {
            try {
                callback(result)
            } catch (error) {
                console.error('Error in refresh subscriber callback:', error)
            }
        })
    }

    /**
     * Check if token refresh is currently in progress
     */
    static isRefreshingToken(): boolean {
        return this.isRefreshing
    }

    /**
     * Force a token refresh (useful for testing or manual refresh)
     */
    static async forceRefresh(): Promise<RefreshResult> {
        // Clear current refresh state
        this.isRefreshing = false
        this.refreshPromise = null

        // Perform fresh refresh
        return this.refreshToken()
    }

    /**
     * Get the current refresh promise (if any)
     */
    static getCurrentRefreshPromise(): Promise<RefreshResult> | null {
        return this.refreshPromise
    }

    /**
     * Clear all refresh state and subscribers
     */
    static clear(): void {
        this.isRefreshing = false
        this.refreshPromise = null
        this.refreshSubscribers = []
    }
}

/**
 * Hook for managing token refresh in React components
 */
export const useTokenRefresh = () => {
    const [isRefreshing, setIsRefreshing] = React.useState(false)
    const [lastRefreshResult, setLastRefreshResult] = React.useState<RefreshResult | null>(null)

    React.useEffect(() => {
        // Subscribe to refresh events
        const unsubscribe = TokenRefreshService.subscribeToRefresh((result) => {
            setIsRefreshing(false)
            setLastRefreshResult(result)
        })

        return unsubscribe
    }, [])

    const refreshToken = React.useCallback(async () => {
        setIsRefreshing(true)
        const result = await TokenRefreshService.refreshToken()
        return result
    }, [])

    return {
        isRefreshing,
        lastRefreshResult,
        refreshToken,
        isRefreshingToken: TokenRefreshService.isRefreshingToken
    }
}
