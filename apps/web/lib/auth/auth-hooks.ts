import { useCallback } from 'react'
import { useAuthStore, useAuth, useAuthActions as useStoreAuthActions } from './auth-store'
import { authAPI, LoginRequest, RegisterRequest, PasswordResetRequest, PasswordResetConfirmRequest, UserProfile } from './auth-api'
import { TokenManager } from './token-manager'

// Hook for authentication actions
export const useAuthActions = () => {
    const storeActions = useStoreAuthActions()

    const login = useCallback(async (credentials: LoginRequest) => {
        try {
            storeActions.setLoading(true)
            storeActions.clearError()

            const response = await authAPI.login(credentials)

            // Update store with user data and tokens
            storeActions.login(response.access_token, response.refresh_token || '', {
                id: response.user.id,
                email: response.user.email,
                display_name: response.user.display_name,
                role: response.user.role as 'admin' | 'writer' | 'reader',
                is_verified: response.user.is_verified,
                is_active: true,
                subscription_tier: 'free',
                created_at: new Date().toISOString(),
            })

            return response
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
            storeActions.setError(errorMessage)
            throw error
        } finally {
            storeActions.setLoading(false)
        }
    }, [storeActions])

    const register = useCallback(async (userData: RegisterRequest) => {
        try {
            storeActions.setLoading(true)
            storeActions.clearError()

            const response = await authAPI.register(userData)

            // Note: Registration doesn't automatically log in the user
            // They need to verify their email first
            return response
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
            storeActions.setError(errorMessage)
            throw error
        } finally {
            storeActions.setLoading(false)
        }
    }, [storeActions])

    const logout = useCallback(async () => {
        try {
            await authAPI.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            storeActions.logout()
        }
    }, [storeActions])

    const getCurrentUser = useCallback(async () => {
        try {
            storeActions.setLoading(true)
            const user = await authAPI.getCurrentUser()

            // Convert UserProfile to User format for the store
            const storeUser = {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                role: user.role as 'admin' | 'writer' | 'reader',
                is_verified: true, // Assume verified if we can get user data
                is_active: user.is_active,
                subscription_tier: user.subscription_tier,
                created_at: user.created_at,
                last_check_in: user.last_check_in,
                avatar_url: user.avatar_url,
                bio: user.bio,
            }

            storeActions.setUser(storeUser)
            return user
        } catch (error: any) {
            if (error.response?.status === 401) {
                // Token invalid, logout user
                storeActions.logout()
            } else {
                const errorMessage = error.response?.data?.detail || error.message || 'Failed to get user'
                storeActions.setError(errorMessage)
            }
            throw error
        } finally {
            storeActions.setLoading(false)
        }
    }, [storeActions])

    const refreshAuth = useCallback(async () => {
        try {
            const newTokenResponse = await authAPI.refreshToken()
            if (newTokenResponse && newTokenResponse.access_token) {
                // Get updated user data
                const user = await authAPI.getCurrentUser()

                // Convert UserProfile to User format for the store
                const storeUser = {
                    id: user.id,
                    email: user.email,
                    display_name: user.display_name,
                    role: user.role as 'admin' | 'writer' | 'reader',
                    is_verified: true, // Assume verified if we can get user data
                    is_active: user.is_active,
                    subscription_tier: user.subscription_tier,
                    created_at: user.created_at,
                    last_check_in: user.last_check_in,
                    avatar_url: user.avatar_url,
                    bio: user.bio,
                }

                // Get current refresh token for the store update
                const currentRefreshToken = TokenManager.getRefreshToken() || ''
                storeActions.refreshAuth(newTokenResponse.access_token, currentRefreshToken, storeUser)
                return true
            }
            return false
        } catch (error) {
            console.error('Token refresh failed:', error)
            storeActions.logout()
            return false
        }
    }, [storeActions])

    const forgotPassword = useCallback(async (email: string) => {
        try {
            storeActions.setLoading(true)
            storeActions.clearError()

            const response = await authAPI.forgotPassword(email)
            return response
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Password reset failed'
            storeActions.setError(errorMessage)
            throw error
        } finally {
            storeActions.setLoading(false)
        }
    }, [storeActions])

    const resetPassword = useCallback(async (token: string, newPassword: string) => {
        try {
            storeActions.setLoading(true)
            storeActions.clearError()

            const response = await authAPI.resetPassword(token, newPassword)
            return response
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Password reset failed'
            storeActions.setError(errorMessage)
            throw error
        } finally {
            storeActions.setLoading(false)
        }
    }, [storeActions])

    const updateUserProfile = useCallback(async (updates: Partial<any>) => {
        try {
            storeActions.setLoading(true)
            storeActions.clearError()

            // This would call an API endpoint to update user profile
            // For now, just update the local store
            storeActions.updateUser(updates)

            return { success: true }
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Profile update failed'
            storeActions.setError(errorMessage)
            throw error
        } finally {
            storeActions.setLoading(false)
        }
    }, [storeActions])

    return {
        login,
        register,
        logout,
        getCurrentUser,
        refreshAuth,
        forgotPassword,
        resetPassword,
        updateUserProfile,
    }
}

// Hook for authentication state
export const useAuthState = () => {
    const { isAuthenticated, user, isLoading, error } = useAuth()
    const { clearError } = useStoreAuthActions()

    return {
        isAuthenticated,
        user,
        isLoading,
        error,
        clearError,
    }
}

// Hook for user information
export const useUser = () => {
    const user = useAuthStore((state) => state.user)
    const updateUser = useAuthStore((state) => state.updateUser)

    return {
        user,
        updateUser,
    }
}

// Hook for checking authentication status
export const useIsAuthenticated = () => {
    return useAuthStore((state) => state.isAuthenticated)
}

// Hook for loading state
export const useAuthLoading = () => {
    return useAuthStore((state) => state.isLoading)
}

// Hook for error state
export const useAuthError = () => {
    const error = useAuthStore((state) => state.error)
    const clearError = useAuthStore((state) => state.clearError)

    return {
        error,
        clearError,
    }
}

// Hook for checking if user has specific role
export const useHasRole = (requiredRole: string | string[]) => {
    const user = useUser().user

    if (!user) return false

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(user.role)
}

// Hook for checking if user is verified
export const useIsVerified = () => {
    const user = useUser().user
    return user?.is_verified || false
}

// Hook for checking if user is admin
export const useIsAdmin = () => {
    return useHasRole('admin')
}

// Hook for checking if user is writer or admin
export const useIsWriter = () => {
    return useHasRole(['writer', 'admin'])
}

// Hook for checking if user is reader
export const useIsReader = () => {
    return useHasRole(['reader', 'writer', 'admin'])
}

// Re-export useAuth and other hooks from auth-store for convenience
export { useAuth, useUser, useIsAuthenticated, useAuthLoading, useAuthError } from './auth-store'
