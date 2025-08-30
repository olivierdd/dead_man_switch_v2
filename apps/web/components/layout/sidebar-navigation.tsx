/**
 * Sidebar Navigation Component
 * Provides role-based sidebar navigation for dashboard layouts
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/lib/auth'
import { usePermissions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    MessageSquare,
    Clock,
    Lock,
    Users,
    BarChart3,
    Settings,
    User,
    ChevronLeft,
    ChevronRight,
    Plus,
    Bell,
    Shield,
    FileText,
    Share2,
    CheckCircle,
    AlertTriangle,
    Zap
} from 'lucide-react'

export interface SidebarSection {
    title: string
    items: SidebarItem[]
    roles: ('admin' | 'writer' | 'reader')[]
    collapsible?: boolean
}

export interface SidebarItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string | number
    description?: string
    isActive?: boolean
    isExternal?: boolean
}

export interface SidebarNavigationProps {
    className?: string
    collapsed?: boolean
    onToggleCollapse?: (collapsed: boolean) => void
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
    className = '',
    collapsed = false,
    onToggleCollapse
}) => {
    const pathname = usePathname()
    const { user, isAuthenticated } = useAuthContext()
    const { isAdmin, isWriter, isReader } = usePermissions()
    const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard'])

    const toggleSection = (sectionTitle: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionTitle)
                ? prev.filter(title => title !== sectionTitle)
                : [...prev, sectionTitle]
        )
    }

    const toggleCollapse = () => {
        const newCollapsed = !collapsed
        onToggleCollapse?.(newCollapsed)
    }

    // Define sidebar sections based on user role
    const getSidebarSections = (): SidebarSection[] => {
        const sections: SidebarSection[] = []

        // Dashboard section (always visible)
        sections.push({
            title: 'Dashboard',
            items: [
                {
                    label: 'Overview',
                    href: '/dashboard',
                    icon: LayoutDashboard,
                    description: 'Main dashboard and quick actions'
                }
            ],
            roles: ['admin', 'writer', 'reader']
        })

        // Writer section
        if (isWriter) {
            sections.push({
                title: 'Content Management',
                items: [
                    {
                        label: 'My Messages',
                        href: '/messages',
                        icon: MessageSquare,
                        badge: '5 active',
                        description: 'Create and manage your messages'
                    },
                    {
                        label: 'Check-in System',
                        href: '/check-in',
                        icon: Clock,
                        badge: '2 days left',
                        description: 'Manage your check-in schedule'
                    },
                    {
                        label: 'File Vault',
                        href: '/vault',
                        icon: Lock,
                        description: 'Secure file storage and management'
                    }
                ],
                roles: ['writer', 'admin'],
                collapsible: true
            })
        }

        // Reader section
        if (isReader) {
            sections.push({
                title: 'Shared Content',
                items: [
                    {
                        label: 'Shared Messages',
                        href: '/shared',
                        icon: Share2,
                        description: 'Messages shared with you'
                    },
                    {
                        label: 'Read Receipts',
                        href: '/receipts',
                        icon: CheckCircle,
                        description: 'Message acknowledgments'
                    }
                ],
                roles: ['reader', 'writer', 'admin'],
                collapsible: true
            })
        }

        // Admin section
        if (isAdmin) {
            sections.push({
                title: 'Administration',
                items: [
                    {
                        label: 'User Management',
                        href: '/admin/users',
                        icon: Users,
                        description: 'Manage user accounts and roles'
                    },
                    {
                        label: 'System Analytics',
                        href: '/admin/analytics',
                        icon: BarChart3,
                        description: 'Platform performance metrics'
                    },
                    {
                        label: 'System Settings',
                        href: '/admin/settings',
                        icon: Settings,
                        description: 'Platform configuration'
                    },
                    {
                        label: 'Audit Logs',
                        href: '/admin/audit',
                        icon: FileText,
                        description: 'System activity logs'
                    }
                ],
                roles: ['admin'],
                collapsible: true
            })
        }

        // Common section for all authenticated users
        if (isAuthenticated) {
            sections.push({
                title: 'Account',
                items: [
                    {
                        label: 'Profile Settings',
                        href: '/profile',
                        icon: User,
                        description: 'Manage your account'
                    },
                    {
                        label: 'Notifications',
                        href: '/notifications',
                        icon: Bell,
                        description: 'Notification preferences'
                    }
                ],
                roles: ['admin', 'writer', 'reader'],
                collapsible: true
            })
        }

        return sections
    }

    const sidebarSections = getSidebarSections()

    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    return (
        <aside className={`
            bg-gray-900/95 backdrop-blur-xl border-r border-white/10 
            transition-all duration-300 ease-in-out
            ${collapsed ? 'w-16' : 'w-64'}
            ${className}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                {!collapsed && (
                    <div className="flex items-center space-x-2">
                        <Shield className="w-6 h-6 text-blue-400" />
                        <span className="text-lg font-semibold text-white">Secret Safe</span>
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapse}
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-2">
                    {sidebarSections.map((section) => {
                        const isExpanded = expandedSections.includes(section.title)
                        const hasAccess = section.roles.some(role => {
                            if (role === 'admin') return isAdmin
                            if (role === 'writer') return isWriter
                            if (role === 'reader') return isReader
                            return false
                        })

                        if (!hasAccess) return null

                        return (
                            <div key={section.title} className="px-3">
                                {/* Section Header */}
                                {section.collapsible ? (
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="w-full flex items-center justify-between text-sm font-medium text-gray-400 hover:text-white transition-colors mb-2"
                                    >
                                        {!collapsed && <span>{section.title}</span>}
                                        {!collapsed && (
                                            <ChevronRight
                                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                            />
                                        )}
                                    </button>
                                ) : (
                                    !collapsed && (
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">{section.title}</h3>
                                    )
                                )}

                                {/* Section Items */}
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = isActiveRoute(item.href)

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`
                                                    group flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                    }
                                                    ${collapsed ? 'justify-center' : ''}
                                                `}
                                            >
                                                <item.icon className="w-4 h-4 flex-shrink-0" />

                                                {!collapsed && (
                                                    <>
                                                        <span className="flex-1">{item.label}</span>
                                                        {item.badge && (
                                                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}

                                                {/* Tooltip for collapsed state */}
                                                {collapsed && (
                                                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                                        {item.label}
                                                        {item.description && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-l-4 border-t-4 border-transparent border-r-gray-800"></div>
                                                    </div>
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </nav>
            </div>

            {/* Footer */}
            {!collapsed && (
                <div className="border-t border-white/10 p-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white capitalize">
                                {user?.role || 'User'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">
                            {user?.display_name || user?.email || 'User'}
                        </p>
                    </div>
                </div>
            )}
        </aside>
    )
}
