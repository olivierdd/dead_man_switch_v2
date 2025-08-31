import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { TokenManager } from './token-manager'

export interface User {
    id: string
    email: string
    display_name: string
    role: 'admin' | 'writer' | 'reader'
    is_verified: boolean
    is_active: boolean
    subscription_tier: string
    avatar_url?: string
    bio?: string
    created_at: string
    last_check_in?: string
}

export interface AuthState {
    // Authentication state
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // User information
    user: User | null

    // JWT tokens
    accessToken: string | null
    refreshToken: string | null
    tokenExpiry: number | null

    // Actions
    login: (accessToken: string, refreshToken: string, user: User) => void
    logout: () => void
    setUser: (user: User) => void
    setError: (error: string | null) => void
    setLoading: (loading: boolean) => void
    updateUser: (updates: Partial<User>) => void
    refreshAuth: (accessToken: string, refreshToken: string, user: User) => void
    clearError: () => void
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                isAuthenticated: false,
                isLoading: false,
                error: null,
                user: null,
                accessToken: null,
                refreshToken: null,
                tokenExpiry: null,

                // Actions
                login: (accessToken: string, refreshToken: string, user: User) => {
                    // Store tokens securely
                    TokenManager.storeTokens(accessToken, refreshToken)

                    set({
                        isAuthenticated: true,
                        user,
                        accessToken,
                        refreshToken,
                        error: null,
                        isLoading: false,
                        tokenExpiry: TokenManager.getTokenExpiry() || Date.now() + (30 * 60 * 1000),
                    })
                },

                logout: () => {
                    // Clear tokens securely
                    TokenManager.clearTokens()

                    set({
                        isAuthenticated: false,
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        tokenExpiry: null,
                        error: null,
                        isLoading: false,
                    })
                },

                setUser: (user: User) => {
                    set({ user })
                },

                setError: (error: string | null) => {
                    set({ error, isLoading: false })
                },

                setLoading: (loading: boolean) => {
                    set({ isLoading: loading })
                },

                updateUser: (updates: Partial<User>) => {
                    const currentUser = get().user
                    if (currentUser) {
                        set({ user: { ...currentUser, ...updates } })
                    }
                },

                refreshAuth: (accessToken: string, refreshToken: string, user: User) => {
                    // Update stored tokens
                    TokenManager.storeTokens(accessToken, refreshToken)

                    set({
                        accessToken,
                        refreshToken,
                        user,
                        tokenExpiry: TokenManager.getTokenExpiry() || Date.now() + (30 * 60 * 1000),
                    })
                },

                clearError: () => {
                    set({ error: null })
                },
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    user: state.user,
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                    tokenExpiry: state.tokenExpiry,
                }),
            }
        ),
        {
            name: 'auth-store',
        }
    )
)

// Selector hooks for better performance
export const useAuth = () => useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
}))

export const useAuthActions = () => useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    setUser: state.setUser,
    setError: state.setError,
    setLoading: state.setLoading,
    updateUser: state.updateUser,
    refreshAuth: state.refreshAuth,
    clearError: state.clearError,
}))

export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)
