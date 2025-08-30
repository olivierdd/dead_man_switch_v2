/**
 * Protected Route Component
 * Wraps routes that require authentication and role-based access control
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthContext } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Shield, Lock, AlertTriangle, Loader2, ArrowRight } from 'lucide-react'

export interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRoles?: ('admin' | 'writer' | 'reader')[]
    minRole?: 'admin' | 'writer' | 'reader'
    redirectTo?: string
    showUnauthorizedMessage?: boolean
    fallback?: React.ReactNode
    className?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRoles = [],
    minRole,
    redirectTo = '/auth/login',
    showUnauthorizedMessage = true,
    fallback,
    className = '',
}) => {
    const router = useRouter()
    const pathname = usePathname()
    const { isAuthenticated, user, isLoading, isInitialized, isRestoring } = useAuthContext()

    const [isChecking, setIsChecking] = useState(true)
    const [accessDenied, setAccessDenied] = useState(false)

    // Role hierarchy for minRole checks
    const roleHierarchy = {
        'reader': 1,
        'writer': 2,
        'admin': 3
    }

    useEffect(() => {
        const checkAccess = async () => {
            // Wait for authentication to be initialized
            if (!isInitialized || isRestoring) {
                return
            }

            setIsChecking(true)

            // Check if user is authenticated
            if (!isAuthenticated) {
                // Store current path for post-login redirect
                if (pathname !== '/auth/login' && pathname !== '/auth/register') {
                    sessionStorage.setItem('redirectAfterLogin', pathname)
                }
                router.push(redirectTo)
                return
            }

            // Check if user data is available
            if (!user) {
                setAccessDenied(true)
                setIsChecking(false)
                return
            }

            // Check role-based access
            let hasAccess = true

            // Check required roles (exact match)
            if (requiredRoles.length > 0) {
                hasAccess = requiredRoles.includes(user.role)
            }

            // Check minimum role requirement
            if (minRole && hasAccess) {
                const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy]
                const requiredRoleLevel = roleHierarchy[minRole]
                hasAccess = userRoleLevel >= requiredRoleLevel
            }

            if (!hasAccess) {
                setAccessDenied(true)
                setIsChecking(false)
                return
            }

            // Access granted
            setAccessDenied(false)
            setIsChecking(false)
        }

        checkAccess()
    }, [isAuthenticated, user, isInitialized, isRestoring, pathname, router, redirectTo, requiredRoles, minRole])

    // Show loading state while checking
    if (isChecking || !isInitialized || isRestoring) {
        return fallback || (
            <div className={`min-h-screen bg-gray-900 flex items-center justify-center ${className}`}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-lg">Checking access...</p>
                    <p className="text-gray-500 text-sm mt-2">Verifying your permissions</p>
                </div>
            </div>
        )
    }

    // Show access denied message
    if (accessDenied) {
        if (!showUnauthorizedMessage) {
            return null
        }

        return (
            <div className={`min-h-screen bg-gray-900 flex items-center justify-center ${className}`}>
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-red-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>

                    <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-gray-300 text-sm mb-2">Required access level:</p>
                        <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-medium">
                                {requiredRoles.length > 0
                                    ? requiredRoles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(' or ')
                                    : minRole
                                        ? `${minRole.charAt(0).toUpperCase() + minRole.slice(1)} or higher`
                                        : 'Authentication required'
                                }
                            </span>
                        </div>

                        {user && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <p className="text-gray-300 text-sm mb-1">Your current role:</p>
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-400 font-medium capitalize">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push('/dashboard')}
                            variant="gradient"
                            className="w-full"
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Go to Dashboard
                        </Button>

                        <Button
                            onClick={() => router.push('/auth/login')}
                            variant="ghost"
                            className="w-full"
                        >
                            Sign in with Different Account
                        </Button>
                    </div>

                    <div className="mt-6 text-xs text-gray-500">
                        <p>If you believe this is an error, please contact support.</p>
                    </div>
                </div>
            </div>
        )
    }

    // Access granted, render children
    return <>{children}</>
}

/**
 * Higher-order component for protecting routes
 */
export const withProtectedRoute = <P extends object>(
    Component: React.ComponentType<P>,
    options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
    const WrappedComponent = (props: P) => (
        <ProtectedRoute {...options}>
            <Component {...props} />
        </ProtectedRoute>
    )

    WrappedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`
    return WrappedComponent
}

/**
 * Role-specific route protection
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute requiredRoles={['admin']}>
        {children}
    </ProtectedRoute>
)

export const WriterRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute minRole="writer">
        {children}
    </ProtectedRoute>
)

export const ReaderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute minRole="reader">
        {children}
    </ProtectedRoute>
)

/**
 * Conditional route protection based on user role
 */
export const RoleBasedRoute: React.FC<{
    children: React.ReactNode
    userRole: string
    requiredRoles: string[]
    fallback?: React.ReactNode
}> = ({ children, userRole, requiredRoles, fallback }) => {
    const hasAccess = requiredRoles.includes(userRole)

    if (!hasAccess) {
        return fallback || null
    }

    return <>{children}</>
}

/**
 * Route protection with custom loading component
 */
export const ProtectedRouteWithCustomLoading: React.FC<ProtectedRouteProps & {
    loadingComponent: React.ReactNode
}> = ({ loadingComponent, ...props }) => (
    <ProtectedRoute {...props} fallback={loadingComponent}>
        {props.children}
    </ProtectedRoute>
)
