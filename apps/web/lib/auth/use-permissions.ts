/**
 * Permissions Hook
 * Provides easy access to permission checking and role-based access control
 */

import { useMemo } from 'react'
import { useAuthContext } from './auth-context'
import { RouteGuard } from './route-guard'

export interface UsePermissionsReturn {
    // Basic permission checks
    canAccess: (path: string) => boolean
    canUseFeature: (feature: string) => boolean
    hasRole: (role: 'admin' | 'writer' | 'reader') => boolean
    hasAnyRole: (roles: ('admin' | 'writer' | 'reader')[]) => boolean
    hasMinRole: (minRole: 'admin' | 'writer' | 'reader') => boolean

    // Role-specific checks
    isAdmin: boolean
    isWriter: boolean
    isReader: boolean

    // Permission levels
    permissionLevel: 'none' | 'read' | 'write' | 'admin'

    // Route information
    accessibleRoutes: string[]
    currentRouteAccess: {
        allowed: boolean
        reason?: string
        requiredRole?: string
        userRole?: string
    }

    // Utility functions
    checkRouteAccess: (path: string) => ReturnType<typeof RouteGuard.checkRouteAccess>
    checkFeatureAccess: (feature: string) => boolean
}

export const usePermissions = (): UsePermissionsReturn => {
    const { isAuthenticated, user, isInitialized } = useAuthContext()

    // Memoize permission checks to avoid unnecessary recalculations
    const permissions = useMemo(() => {
        const userRole = user?.role
        const isAuth = isAuthenticated && isInitialized

        return {
            // Basic permission checks
            canAccess: (path: string) => {
                const result = RouteGuard.checkRouteAccess(path, userRole, isAuth)
                return result.allowed
            },

            canUseFeature: (feature: string) => {
                return RouteGuard.checkFeatureAccess(feature, userRole, isAuth)
            },

            hasRole: (role: 'admin' | 'writer' | 'reader') => {
                return userRole === role
            },

            hasAnyRole: (roles: ('admin' | 'writer' | 'reader')[]) => {
                return roles.includes(userRole as any)
            },

            hasMinRole: (minRole: 'admin' | 'writer' | 'reader') => {
                if (!userRole) return false

                const roleHierarchy = { 'reader': 1, 'writer': 2, 'admin': 3 }
                const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy]
                const requiredRoleLevel = roleHierarchy[minRole]

                return userRoleLevel >= requiredRoleLevel
            },

            // Role-specific checks
            isAdmin: userRole === 'admin',
            isWriter: userRole === 'writer' || userRole === 'admin',
            isReader: userRole === 'reader' || userRole === 'writer' || userRole === 'admin',

            // Permission level
            permissionLevel: RouteGuard.getUserPermissionLevel('/', userRole, isAuth),

            // Accessible routes
            accessibleRoutes: RouteGuard.getAccessibleRoutes(userRole, isAuth),

            // Current route access (assuming we're on a specific route)
            currentRouteAccess: {
                allowed: true, // Will be updated by components that use this
                reason: undefined,
                requiredRole: undefined,
                userRole
            }
        }
    }, [isAuthenticated, user, isInitialized])

    // Additional utility functions
    const checkRouteAccess = (path: string) => {
        return RouteGuard.checkRouteAccess(path, user?.role, isAuthenticated && isInitialized)
    }

    const checkFeatureAccess = (feature: string) => {
        return RouteGuard.checkFeatureAccess(feature, user?.role, isAuthenticated && isInitialized)
    }

    return {
        ...permissions,
        checkRouteAccess,
        checkFeatureAccess
    }
}

/**
 * Hook for checking specific feature permissions
 */
export const useFeaturePermission = (feature: string): boolean => {
    const { canUseFeature } = usePermissions()
    return canUseFeature(feature)
}

/**
 * Hook for checking route access
 */
export const useRouteAccess = (path: string): {
    allowed: boolean
    reason?: string
    requiredRole?: string
    userRole?: string
} => {
    const { checkRouteAccess } = usePermissions()
    return checkRouteAccess(path)
}

/**
 * Hook for role-based conditional rendering
 */
export const useRoleCondition = (requiredRole: 'admin' | 'writer' | 'reader'): boolean => {
    const { hasMinRole } = usePermissions()
    return hasMinRole(requiredRole)
}

/**
 * Hook for admin-only features
 */
export const useAdminOnly = (): boolean => {
    const { isAdmin } = usePermissions()
    return isAdmin
}

/**
 * Hook for writer-or-higher features
 */
export const useWriterOrHigher = (): boolean => {
    const { isWriter } = usePermissions()
    return isWriter
}

/**
 * Hook for reader-or-higher features
 */
export const useReaderOrHigher = (): boolean => {
    const { isReader } = usePermissions()
    return isReader
}
