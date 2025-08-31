'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuthStore, useAuth, useAuthActions } from './auth-store'
import { useAuthPersistence } from './use-auth-persistence'

interface AuthContextType {
    isAuthenticated: boolean
    user: any
    isLoading: boolean
    error: string | null
    login: (accessToken: string, refreshToken: string, user: any) => void
    logout: () => void
    setUser: (user: any) => void
    setError: (error: string | null) => void
    setLoading: (loading: boolean) => void
    updateUser: (updates: Partial<any>) => void
    refreshAuth: (accessToken: string, refreshToken: string, user: any) => void
    clearError: () => void

    // Persistence methods
    restoreAuth: () => Promise<void>
    clearAuth: () => void
    validateState: () => Promise<boolean>
    isInitialized: boolean
    isRestoring: boolean
    persistenceError: string | null
    storageInfo: {
        storageType: string
        hasTokens: boolean
        tokenExpiry: number | null
        timeUntilExpiry: number | null
    }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const authState = useAuth()
    const authActions = useAuthActions()
    const persistence = useAuthPersistence()

    // Show loading state while restoring authentication
    if (persistence.isRestoring) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Restoring your session...</p>
                </div>
            </div>
        )
    }

    // Show error state if restoration failed
    if (persistence.error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-white mb-2">Session Restoration Failed</h2>
                    <p className="text-gray-400 mb-4">{persistence.error}</p>
                    <button
                        onClick={persistence.restoreAuth}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={persistence.clearAuth}
                        className="ml-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Clear Session
                    </button>
                </div>
            </div>
        )
    }

    const contextValue: AuthContextType = {
        ...authState,
        ...authActions,
        // Add persistence methods to context
        restoreAuth: persistence.restoreAuth,
        clearAuth: persistence.clearAuth,
        validateState: persistence.validateState,
        isInitialized: persistence.isInitialized,
        isRestoring: persistence.isRestoring,
        persistenceError: persistence.error,
        storageInfo: persistence.storageInfo,
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

// Higher-order component for components that need auth context
export const withAuth = <P extends object>(
    Component: React.ComponentType<P>
) => {
    const WrappedComponent = (props: P) => {
        const auth = useAuthContext()
        return <Component {...props} auth={auth} />
    }

    WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
    return WrappedComponent
}
