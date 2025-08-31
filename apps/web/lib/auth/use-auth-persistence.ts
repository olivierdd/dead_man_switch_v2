/**
 * Authentication Persistence Hook
 * Manages authentication state persistence and restoration
 */

import { useEffect, useState, useCallback } from 'react'
import { AuthPersistenceService, PersistenceResult } from './auth-persistence'
import { useAuthStore } from './auth-store'
import { TokenManager } from './token-manager'

export interface UseAuthPersistenceReturn {
    isInitialized: boolean
    isRestoring: boolean
    error: string | null
    restoreAuth: () => Promise<void>
    clearAuth: () => void
    validateState: () => Promise<boolean>
    storageInfo: {
        storageType: string
        hasTokens: boolean
        tokenExpiry: number | null
        timeUntilExpiry: number | null
    }
}

export const useAuthPersistence = (): UseAuthPersistenceReturn => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [isRestoring, setIsRestoring] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        login,
        logout,
        setUser,
        setError: setStoreError,
        setLoading
    } = useAuthStore()

    /**
     * Restore authentication state from storage
     */
    const restoreAuth = useCallback(async () => {
        try {
            setIsRestoring(true)
            setError(null)
            setStoreError(null)

            // Attempt to restore auth state
            const result = await AuthPersistenceService.restoreAuthState()

            if (result.success) {
                // Restore state to store
                if (result.state.isAuthenticated && result.state.accessToken && result.state.refreshToken) {
                    // Update tokens in store
                    if (result.state.user) {
                        // We have complete user data
                        login(result.state.accessToken, result.state.refreshToken, result.state.user)
                    } else {
                        // We have tokens but need to fetch user data
                        setLoading(true)
                        try {
                            // This will be handled by the auth context or component
                            // For now, just set the basic state
                            login(result.state.accessToken, result.state.refreshToken, {
                                id: 'temp',
                                email: 'loading@example.com',
                                display_name: 'Loading...',
                                role: 'reader',
                                is_verified: false,
                                is_active: false,
                                subscription_tier: 'free',
                                created_at: new Date().toISOString()
                            })
                        } catch (userError) {
                            console.error('Failed to fetch user data during restoration:', userError)
                            // Still keep the user logged in, they can refresh manually
                        } finally {
                            setLoading(false)
                        }
                    }
                } else {
                    // No valid authentication state
                    logout()
                }

                // Show any warnings
                if (result.error) {
                    console.warn('Auth restoration warning:', result.error)
                }

            } else {
                // Restoration failed
                setError(result.error || 'Failed to restore authentication state')
                logout()
            }

        } catch (error: any) {
            console.error('Auth restoration error:', error)
            setError(error.message || 'Authentication restoration failed')
            logout()
        } finally {
            setIsRestoring(false)
            setIsInitialized(true)
        }
    }, [login, logout, setUser, setStoreError, setLoading])

    /**
     * Clear all authentication data
     */
    const clearAuth = useCallback(() => {
        try {
            AuthPersistenceService.clearPersistedData()
            logout()
            setError(null)
        } catch (error) {
            console.error('Failed to clear auth data:', error)
        }
    }, [logout])

    /**
     * Validate current authentication state
     */
    const validateState = useCallback(async (): Promise<boolean> => {
        try {
            const isValid = await AuthPersistenceService.validateCurrentState()

            if (!isValid) {
                // State is invalid, clear it
                clearAuth()
            }

            return isValid
        } catch (error) {
            console.error('Failed to validate auth state:', error)
            clearAuth()
            return false
        }
    }, [clearAuth])

    /**
     * Get storage information
     */
    const storageInfo = AuthPersistenceService.getStorageInfo()

    /**
     * Initialize authentication state on mount
     */
    useEffect(() => {
        const initializeAuth = async () => {
            // Check if we're in a browser environment
            if (typeof window === 'undefined') {
                return
            }

            // Check if we have any stored tokens
            const hasTokens = TokenManager.isAuthenticated()

            if (hasTokens) {
                // Attempt to restore authentication
                await restoreAuth()
            } else {
                // No tokens, mark as initialized
                setIsInitialized(true)
            }
        }

        initializeAuth()
    }, [restoreAuth])

    /**
     * Set up periodic state validation
     */
    useEffect(() => {
        if (!isInitialized) return

        // Validate state every 5 minutes
        const interval = setInterval(() => {
            validateState()
        }, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [isInitialized, validateState])

    /**
     * Set up storage event listeners for cross-tab synchronization
     */
    useEffect(() => {
        if (typeof window === 'undefined') return

        const handleStorageChange = (event: StorageEvent) => {
            // Only handle our auth-related storage changes
            if (event.key?.startsWith('secret_safe_')) {
                // Check if tokens were cleared in another tab
                if (event.key === 'secret_safe_access_token' && !event.newValue) {
                    // Token was cleared, logout in this tab
                    logout()
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [logout])

    return {
        isInitialized,
        isRestoring,
        error,
        restoreAuth,
        clearAuth,
        validateState,
        storageInfo
    }
}
