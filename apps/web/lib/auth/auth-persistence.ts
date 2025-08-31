/**
 * Authentication Persistence Service
 * Handles state restoration and validation across page refreshes
 */

import { TokenManager } from './token-manager'
import { TokenRefreshService } from './token-refresh'
import { authAPI } from './auth-api'

export interface PersistenceState {
    isAuthenticated: boolean
    user: any
    accessToken: string | null
    refreshToken: string | null
    tokenExpiry: number | null
}

export interface PersistenceResult {
    success: boolean
    state: PersistenceState
    error?: string
    requiresRefresh?: boolean
}

export class AuthPersistenceService {
    private static readonly PERSISTENCE_KEY = 'secret_safe_auth_persistence'
    private static readonly PERSISTENCE_VERSION = '1.0'

    /**
     * Initialize authentication state from storage
     */
    static async initializeAuthState(): Promise<PersistenceResult> {
        try {
            // Check if we have valid tokens
            const accessToken = TokenManager.getAccessToken()
            const refreshToken = TokenManager.getRefreshToken()

            if (!accessToken || !refreshToken) {
                return {
                    success: false,
                    state: this.getDefaultState(),
                    error: 'No valid tokens found'
                }
            }

            // Check if token needs refresh
            if (TokenManager.shouldRefreshToken()) {
                return {
                    success: true,
                    state: {
                        isAuthenticated: true,
                        user: null, // Will be fetched after refresh
                        accessToken,
                        refreshToken,
                        tokenExpiry: TokenManager.getTokenExpiry()
                    },
                    requiresRefresh: true
                }
            }

            // Try to get current user to validate token
            try {
                const user = await authAPI.getCurrentUser()

                return {
                    success: true,
                    state: {
                        isAuthenticated: true,
                        user: this.transformUserProfile(user),
                        accessToken,
                        refreshToken,
                        tokenExpiry: TokenManager.getTokenExpiry()
                    }
                }

            } catch (error: any) {
                if (error.response?.status === 401) {
                    // Token is invalid, clear everything
                    TokenManager.clearTokens()
                    return {
                        success: false,
                        state: this.getDefaultState(),
                        error: 'Token validation failed'
                    }
                }

                // Other error, but we can still restore basic state
                return {
                    success: true,
                    state: {
                        isAuthenticated: true,
                        user: null,
                        accessToken,
                        refreshToken,
                        tokenExpiry: TokenManager.getTokenExpiry()
                    },
                    error: 'Failed to fetch user data'
                }
            }

        } catch (error) {
            console.error('Failed to initialize auth state:', error)
            return {
                success: false,
                state: this.getDefaultState(),
                error: 'Initialization failed'
            }
        }
    }

    /**
     * Restore authentication state and validate tokens
     */
    static async restoreAuthState(): Promise<PersistenceResult> {
        try {
            // First, try to initialize from storage
            const initResult = await this.initializeAuthState()

            if (!initResult.success) {
                return initResult
            }

            // If refresh is required, attempt it
            if (initResult.requiresRefresh) {
                const refreshResult = await TokenRefreshService.refreshToken()

                if (refreshResult.success) {
                    // Try to get user data again after refresh
                    try {
                        const user = await authAPI.getCurrentUser()

                        return {
                            success: true,
                            state: {
                                ...initResult.state,
                                user: this.transformUserProfile(user),
                                accessToken: refreshResult.newAccessToken || initResult.state.accessToken
                            }
                        }

                    } catch (error) {
                        // Refresh succeeded but user fetch failed
                        return {
                            success: true,
                            state: {
                                ...initResult.state,
                                accessToken: refreshResult.newAccessToken || initResult.state.accessToken
                            },
                            error: 'Failed to fetch user data after refresh'
                        }
                    }
                } else {
                    // Refresh failed, clear tokens
                    TokenManager.clearTokens()
                    return {
                        success: false,
                        state: this.getDefaultState(),
                        error: refreshResult.error || 'Token refresh failed'
                    }
                }
            }

            return initResult

        } catch (error) {
            console.error('Failed to restore auth state:', error)
            return {
                success: false,
                state: this.getDefaultState(),
                error: 'Restoration failed'
            }
        }
    }

    /**
     * Validate current authentication state
     */
    static async validateCurrentState(): Promise<boolean> {
        try {
            const accessToken = TokenManager.getAccessToken()
            if (!accessToken) return false

            // Check if token is expired
            if (TokenManager.shouldRefreshToken()) {
                const refreshResult = await TokenRefreshService.refreshToken()
                return refreshResult.success
            }

            // Token is still valid
            return true

        } catch (error) {
            console.error('Failed to validate current state:', error)
            return false
        }
    }

    /**
     * Clear all persisted authentication data
     */
    static clearPersistedData(): void {
        try {
            // Clear tokens
            TokenManager.clearTokens()

            // Clear any other persisted data
            localStorage.removeItem(this.PERSISTENCE_KEY)
            sessionStorage.removeItem(this.PERSISTENCE_KEY)

        } catch (error) {
            console.error('Failed to clear persisted data:', error)
        }
    }

    /**
     * Get authentication state for persistence
     */
    static getStateForPersistence(): PersistenceState {
        try {
            const accessToken = TokenManager.getAccessToken()
            const refreshToken = TokenManager.getRefreshToken()

            return {
                isAuthenticated: !!(accessToken && refreshToken),
                user: null, // Don't persist user data, fetch fresh
                accessToken,
                refreshToken,
                tokenExpiry: TokenManager.getTokenExpiry()
            }
        } catch (error) {
            console.error('Failed to get state for persistence:', error)
            return this.getDefaultState()
        }
    }

    /**
     * Check if authentication state is valid and current
     */
    static isStateValid(): boolean {
        try {
            const accessToken = TokenManager.getAccessToken()
            const refreshToken = TokenManager.getRefreshToken()

            if (!accessToken || !refreshToken) {
                return false
            }

            // Check if access token is expired
            if (TokenManager.shouldRefreshToken()) {
                return false
            }

            return true

        } catch (error) {
            console.error('Failed to check state validity:', error)
            return false
        }
    }

    /**
     * Get default authentication state
     */
    private static getDefaultState(): PersistenceState {
        return {
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            tokenExpiry: null
        }
    }

    /**
     * Transform UserProfile to User format for the store
     */
    private static transformUserProfile(userProfile: any): any {
        return {
            id: userProfile.id,
            email: userProfile.email,
            display_name: userProfile.display_name,
            role: userProfile.role as 'admin' | 'writer' | 'reader',
            is_verified: true, // Assume verified if we can get user data
            is_active: userProfile.is_active,
            subscription_tier: userProfile.subscription_tier,
            created_at: userProfile.created_at,
            last_check_in: userProfile.last_check_in,
            avatar_url: userProfile.avatar_url,
            bio: userProfile.bio,
        }
    }

    /**
     * Get storage information for debugging
     */
    static getStorageInfo(): {
        storageType: string
        hasTokens: boolean
        tokenExpiry: number | null
        timeUntilExpiry: number | null
    } {
        try {
            const storageType = TokenManager.getStorageType()
            const hasTokens = !!(TokenManager.getAccessToken() && TokenManager.getRefreshToken())
            const tokenExpiry = TokenManager.getTokenExpiry()
            const timeUntilExpiry = TokenManager.getTimeUntilExpiry()

            return {
                storageType,
                hasTokens,
                tokenExpiry,
                timeUntilExpiry
            }
        } catch (error) {
            console.error('Failed to get storage info:', error)
            return {
                storageType: 'unknown',
                hasTokens: false,
                tokenExpiry: null,
                timeUntilExpiry: null
            }
        }
    }
}
