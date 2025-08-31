/**
 * Main Navigation Component
 * Provides role-based navigation with dynamic menu items
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/lib/auth'
import { usePermissions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { AuthStatusIndicator } from '@/components/auth/auth-status-indicator'
import { SessionTimer } from '@/components/auth/session-timer'
import { UserActivityIndicator } from '@/components/auth/user-activity-indicator'
import { ForevrLogo } from '@/components/ui/forevr-logo'
import {
    Home,
    LayoutDashboard,
    MessageSquare,
    Clock,
    Lock,
    Users,
    BarChart3,
    Settings,
    User,
    LogOut,
    Menu,
    X,
    Shield,
    Bell,
    Search,
    Plus
} from 'lucide-react'

export interface NavigationItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    roles: ('admin' | 'writer' | 'reader')[]
    badge?: string | number
    description?: string
    isExternal?: boolean
}

export const MainNavigation: React.FC = () => {
    const pathname = usePathname()
    const { user, isAuthenticated, logout } = useAuthContext()
    const { isAdmin, isWriter, isReader } = usePermissions()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (!target.closest('.user-menu')) {
                setIsUserMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Define navigation items based on user role
    const getNavigationItems = (): NavigationItem[] => {
        const baseItems: NavigationItem[] = [
            {
                label: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
                roles: ['admin', 'writer', 'reader'],
                description: 'Overview and quick actions'
            }
        ]

        const roleSpecificItems: NavigationItem[] = []

        // Admin-specific items
        if (isAdmin) {
            roleSpecificItems.push(
                {
                    label: 'User Management',
                    href: '/admin/users',
                    icon: Users,
                    roles: ['admin'],
                    description: 'Manage user accounts and roles'
                },
                {
                    label: 'System Analytics',
                    href: '/admin/analytics',
                    icon: BarChart3,
                    roles: ['admin'],
                    description: 'Platform performance and usage metrics'
                },
                {
                    label: 'System Settings',
                    href: '/admin/settings',
                    icon: Settings,
                    roles: ['admin'],
                    description: 'Platform configuration and settings'
                }
            )
        }

        // Writer-specific items
        if (isWriter) {
            roleSpecificItems.push(
                {
                    label: 'Messages',
                    href: '/messages',
                    icon: MessageSquare,
                    roles: ['writer', 'admin'],
                    description: 'Create and manage your messages',
                    badge: '5 active'
                },
                {
                    label: 'Check-in',
                    href: '/check-in',
                    icon: Clock,
                    roles: ['writer', 'admin'],
                    description: 'Manage your check-in schedule',
                    badge: '2 days left'
                },
                {
                    label: 'Vault',
                    href: '/vault',
                    icon: Lock,
                    roles: ['writer', 'admin'],
                    description: 'Secure file storage and management'
                }
            )
        }

        // Reader-specific items
        if (isReader) {
            roleSpecificItems.push(
                {
                    label: 'Shared Messages',
                    href: '/shared',
                    icon: MessageSquare,
                    roles: ['reader', 'writer', 'admin'],
                    description: 'Messages shared with you'
                },
                {
                    label: 'Receipts',
                    href: '/receipts',
                    icon: Bell,
                    roles: ['reader', 'writer', 'admin'],
                    description: 'Message read receipts and acknowledgments'
                }
            )
        }

        // Common items for all authenticated users
        if (isAuthenticated) {
            roleSpecificItems.push(
                {
                    label: 'Profile',
                    href: '/profile',
                    icon: User,
                    roles: ['admin', 'writer', 'reader'],
                    description: 'Manage your account settings'
                }
            )
        }

        return [...baseItems, ...roleSpecificItems]
    }

    const navigationItems = getNavigationItems()

    const handleLogout = () => {
        logout()
        setIsUserMenuOpen(false)
    }

    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    return (
        <nav className="bg-gray-900/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <ForevrLogo variant="compact" className="h-8 w-auto" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                                    ${isActiveRoute(item.href)
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <div className="flex items-center space-x-2">
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    {item.description}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            <Search className="w-4 h-4" />
                        </Button>

                        {/* Authentication Status Indicators */}
                        {isAuthenticated && (
                            <>
                                {/* Session Timer */}
                                <SessionTimer compact={true} />

                                {/* Auth Status Indicator */}
                                <AuthStatusIndicator compact={true} />

                                {/* User Activity Indicator */}
                                <UserActivityIndicator compact={true} />
                            </>
                        )}

                        {/* Notifications */}
                        {isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white hover:bg-white/5 relative"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                            </Button>
                        )}

                        {/* User Menu */}
                        {isAuthenticated && user ? (
                            <div className="relative user-menu">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/5"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <ForevrLogo variant="icon" className="w-5 h-5" />
                                    </div>
                                    <span className="hidden sm:block">{user.display_name || user.email}</span>
                                </Button>

                                {/* User Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-white/10 py-2 z-50">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-sm font-medium text-white">{user.display_name || 'User'}</p>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <Shield className="w-3 h-3 text-blue-400" />
                                                <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <User className="w-4 h-4" />
                                                <span>Profile Settings</span>
                                            </Link>

                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>Admin Panel</span>
                                                </Link>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button variant="gradient" size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-white/10">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        group flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors
                                        ${isActiveRoute(item.href)
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
