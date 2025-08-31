/**
 * Route Guard Utility
 * Provides route protection logic for Next.js middleware and server components
 */

import { TokenManager } from './token-manager'

export interface RouteGuardConfig {
    path: string
    requiredRoles?: ('admin' | 'writer' | 'reader')[]
    minRole?: 'admin' | 'writer' | 'reader'
    public?: boolean
    redirectTo?: string
}

export interface RouteGuardResult {
    allowed: boolean
    redirectTo?: string
    reason?: string
    requiredRole?: string
    userRole?: string
}

export class RouteGuard {
    private static readonly ROLE_HIERARCHY = {
        'reader': 1,
        'writer': 2,
        'admin': 3
    }

    /**
     * Check if a route is accessible based on authentication and role requirements
     */
    static checkRouteAccess(
        path: string,
        userRole?: string,
        isAuthenticated: boolean = false
    ): RouteGuardResult {
        // Define route configurations
        const routeConfigs: RouteGuardConfig[] = [
            // Public routes (no auth required)
            { path: '/', public: true },
            { path: '/auth/login', public: true },
            { path: '/auth/register', public: true },
            { path: '/auth/forgot-password', public: true },
            { path: '/auth/reset-password', public: true },
            { path: '/how-it-works', public: true },
            { path: '/pricing', public: true },
            { path: '/security', public: true },
            { path: '/about', public: true },
            { path: '/contact', public: true },
            { path: '/privacy', public: true },
            { path: '/terms', public: true },
            { path: '/faq', public: true },

            // Protected routes with role requirements
            { path: '/dashboard', minRole: 'reader' },
            { path: '/profile', minRole: 'reader' },
            { path: '/messages', minRole: 'writer' },
            { path: '/check-in', minRole: 'writer' },
            { path: '/vault', minRole: 'writer' },
            { path: '/admin', requiredRoles: ['admin'] },
            { path: '/admin/users', requiredRoles: ['admin'] },
            { path: '/admin/analytics', requiredRoles: ['admin'] },
            { path: '/admin/settings', requiredRoles: ['admin'] },

            // API routes
            { path: '/api/auth', public: true },
            { path: '/api/public', public: true },
            { path: '/api/admin', requiredRoles: ['admin'] },
        ]

        // Find matching route configuration
        const routeConfig = this.findMatchingRoute(path, routeConfigs)

        if (!routeConfig) {
            // No specific configuration, default to requiring authentication
            return {
                allowed: isAuthenticated,
                redirectTo: isAuthenticated ? undefined : '/auth/login',
                reason: isAuthenticated ? undefined : 'Authentication required'
            }
        }

        // Public route
        if (routeConfig.public) {
            return { allowed: true }
        }

        // Check authentication
        if (!isAuthenticated) {
            return {
                allowed: false,
                redirectTo: routeConfig.redirectTo || '/auth/login',
                reason: 'Authentication required'
            }
        }

        // Check role requirements
        if (routeConfig.requiredRoles && userRole) {
            const hasRequiredRole = routeConfig.requiredRoles.includes(userRole as any)

            if (!hasRequiredRole) {
                return {
                    allowed: false,
                    redirectTo: '/dashboard',
                    reason: 'Insufficient permissions',
                    requiredRole: routeConfig.requiredRoles.join(' or '),
                    userRole
                }
            }
        }

        if (routeConfig.minRole && userRole) {
            const userRoleLevel = this.ROLE_HIERARCHY[userRole as keyof typeof this.ROLE_HIERARCHY]
            const requiredRoleLevel = this.ROLE_HIERARCHY[routeConfig.minRole]

            if (userRoleLevel < requiredRoleLevel) {
                return {
                    allowed: false,
                    redirectTo: '/dashboard',
                    reason: 'Insufficient permissions',
                    requiredRole: `${routeConfig.minRole} or higher`,
                    userRole
                }
            }
        }

        // Access granted
        return { allowed: true }
    }

    /**
     * Check if a user has access to a specific feature or action
     */
    static checkFeatureAccess(
        feature: string,
        userRole?: string,
        isAuthenticated: boolean = false
    ): boolean {
        const featurePermissions: Record<string, { minRole?: string; requiredRoles?: string[] }> = {
            // Message management
            'messages.create': { minRole: 'writer' },
            'messages.edit': { minRole: 'writer' },
            'messages.delete': { minRole: 'writer' },
            'messages.share': { minRole: 'writer' },
            'messages.view': { minRole: 'reader' },

            // Check-in system
            'checkin.perform': { minRole: 'writer' },
            'checkin.view': { minRole: 'reader' },
            'checkin.manage': { minRole: 'writer' },

            // Vault management
            'vault.upload': { minRole: 'writer' },
            'vault.download': { minRole: 'writer' },
            'vault.delete': { minRole: 'writer' },
            'vault.view': { minRole: 'reader' },

            // User management (admin only)
            'users.create': { requiredRoles: ['admin'] },
            'users.edit': { requiredRoles: ['admin'] },
            'users.delete': { requiredRoles: ['admin'] },
            'users.view': { requiredRoles: ['admin'] },
            'users.role_change': { requiredRoles: ['admin'] },

            // System management (admin only)
            'system.analytics': { requiredRoles: ['admin'] },
            'system.settings': { requiredRoles: ['admin'] },
            'system.logs': { requiredRoles: ['admin'] },
            'system.backup': { requiredRoles: ['admin'] },

            // Profile management
            'profile.view': { minRole: 'reader' },
            'profile.edit': { minRole: 'reader' },
            'profile.delete': { minRole: 'reader' },

            // Billing and subscription
            'billing.view': { minRole: 'writer' },
            'billing.manage': { minRole: 'writer' },
            'billing.upgrade': { minRole: 'writer' },
        }

        const permission = featurePermissions[feature]

        if (!permission) {
            // No specific permission defined, default to requiring authentication
            return isAuthenticated
        }

        if (!isAuthenticated) {
            return false
        }

        if (!userRole) {
            return false
        }

        // Check required roles
        if (permission.requiredRoles) {
            return permission.requiredRoles.includes(userRole as any)
        }

        // Check minimum role
        if (permission.minRole) {
            const userRoleLevel = this.ROLE_HIERARCHY[userRole as keyof typeof this.ROLE_HIERARCHY]
            const requiredRoleLevel = this.ROLE_HIERARCHY[permission.minRole as keyof typeof this.ROLE_HIERARCHY]
            return userRoleLevel >= requiredRoleLevel
        }

        return true
    }

    /**
     * Get all accessible routes for a user
     */
    static getAccessibleRoutes(
        userRole?: string,
        isAuthenticated: boolean = false
    ): string[] {
        const allRoutes = [
            '/',
            '/dashboard',
            '/profile',
            '/messages',
            '/check-in',
            '/vault',
            '/admin',
            '/admin/users',
            '/admin/analytics',
            '/admin/settings',
            '/how-it-works',
            '/pricing',
            '/security',
            '/about',
            '/contact',
            '/privacy',
            '/terms',
            '/faq'
        ]

        return allRoutes.filter(route => {
            const result = this.checkRouteAccess(route, userRole, isAuthenticated)
            return result.allowed
        })
    }

    /**
     * Get user's permission level for a specific route
     */
    static getUserPermissionLevel(
        path: string,
        userRole?: string,
        isAuthenticated: boolean = false
    ): 'none' | 'read' | 'write' | 'admin' {
        const result = this.checkRouteAccess(path, userRole, isAuthenticated)

        if (!result.allowed) {
            return 'none'
        }

        if (!userRole) {
            return 'read'
        }

        switch (userRole) {
            case 'admin':
                return 'admin'
            case 'writer':
                return 'write'
            case 'reader':
                return 'read'
            default:
                return 'read'
        }
    }

    /**
     * Find matching route configuration
     */
    private static findMatchingRoute(
        path: string,
        routeConfigs: RouteGuardConfig[]
    ): RouteGuardConfig | undefined {
        // Exact match first
        let exactMatch = routeConfigs.find(config => config.path === path)
        if (exactMatch) return exactMatch

        // Pattern match for dynamic routes
        for (const config of routeConfigs) {
            if (this.pathMatchesPattern(path, config.path)) {
                return config
            }
        }

        return undefined
    }

    /**
     * Check if a path matches a pattern (supports basic wildcards)
     */
    private static pathMatchesPattern(path: string, pattern: string): boolean {
        // Convert pattern to regex
        const regexPattern = pattern
            .replace(/\[.*?\]/g, '[^/]+') // Replace [param] with wildcard
            .replace(/\*/g, '.*') // Replace * with wildcard
            .replace(/\?/g, '.?') // Replace ? with optional character

        const regex = new RegExp(`^${regexPattern}$`)
        return regex.test(path)
    }

    /**
     * Get route metadata for debugging
     */
    static getRouteMetadata(path: string): {
        isPublic: boolean
        requiresAuth: boolean
        requiredRoles: string[]
        minRole: string | null
        description: string
    } {
        const result = this.checkRouteAccess(path)

        return {
            isPublic: result.allowed && !result.requiredRole,
            requiresAuth: !result.allowed && result.reason === 'Authentication required',
            requiredRoles: result.requiredRole ? [result.requiredRole] : [],
            minRole: result.requiredRole?.includes('or higher')
                ? result.requiredRole.replace(' or higher', '')
                : null,
            description: this.getRouteDescription(path)
        }
    }

    /**
     * Get human-readable description for a route
     */
    private static getRouteDescription(path: string): string {
        const descriptions: Record<string, string> = {
            '/': 'Landing page - Public access',
            '/dashboard': 'User dashboard - Requires authentication',
            '/profile': 'User profile management - Requires authentication',
            '/messages': 'Message management - Requires writer role or higher',
            '/check-in': 'Check-in system - Requires writer role or higher',
            '/vault': 'File vault - Requires writer role or higher',
            '/admin': 'Admin panel - Requires admin role',
            '/admin/users': 'User management - Requires admin role',
            '/admin/analytics': 'System analytics - Requires admin role',
            '/admin/settings': 'System settings - Requires admin role',
            '/auth/login': 'User login - Public access',
            '/auth/register': 'User registration - Public access',
            '/how-it-works': 'How it works page - Public access',
            '/pricing': 'Pricing information - Public access',
            '/security': 'Security details - Public access',
            '/about': 'About page - Public access',
            '/contact': 'Contact information - Public access',
            '/privacy': 'Privacy policy - Public access',
            '/terms': 'Terms of service - Public access',
            '/faq': 'Frequently asked questions - Public access'
        }

        return descriptions[path] || 'Route access information not available'
    }
}
