/**
 * Breadcrumb Navigation Component
 * Shows current page hierarchy and provides quick navigation
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home, Settings, Users, BarChart3, MessageSquare, Clock, Lock, User, Shield } from 'lucide-react'

export interface BreadcrumbItem {
    label: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    isCurrent?: boolean
}

export interface BreadcrumbNavigationProps {
    className?: string
    showHome?: boolean
    customItems?: BreadcrumbItem[]
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
    className = '',
    showHome = true,
    customItems
}) => {
    const pathname = usePathname()

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        if (customItems) {
            return customItems
        }

        const segments = pathname.split('/').filter(Boolean)
        const breadcrumbs: BreadcrumbItem[] = []

        // Add home if requested
        if (showHome) {
            breadcrumbs.push({
                label: 'Home',
                href: '/',
                icon: Home
            })
        }

        let currentPath = ''

        segments.forEach((segment, index) => {
            currentPath += `/${segment}`

            // Get icon for common routes
            let icon: React.ComponentType<{ className?: string }> | undefined

            if (segment === 'dashboard') icon = Shield
            else if (segment === 'admin') icon = Settings
            else if (segment === 'users') icon = Users
            else if (segment === 'analytics') icon = BarChart3
            else if (segment === 'messages') icon = MessageSquare
            else if (segment === 'check-in') icon = Clock
            else if (segment === 'vault') icon = Lock
            else if (segment === 'profile') icon = User

            // Format label
            let label = segment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')

            // Special cases
            if (segment === 'check-in') label = 'Check-in'
            else if (segment === 'file-upload') label = 'File Upload'

            breadcrumbs.push({
                label,
                href: currentPath,
                icon,
                isCurrent: index === segments.length - 1
            })
        })

        return breadcrumbs
    }

    const breadcrumbs = generateBreadcrumbs()

    if (breadcrumbs.length <= 1) {
        return null
    }

    return (
        <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.href}>
                    {index > 0 && (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}

                    {item.isCurrent ? (
                        <div className="flex items-center space-x-2 text-gray-400">
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span className="font-medium">{item.label}</span>
                        </div>
                    ) : (
                        <Link
                            href={item.href}
                            className="flex items-center space-x-2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span>{item.label}</span>
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    )
}

/**
 * Page Header with Breadcrumbs
 */
export const PageHeader: React.FC<{
    title: string
    description?: string
    breadcrumbs?: BreadcrumbItem[]
    actions?: React.ReactNode
    className?: string
}> = ({ title, description, breadcrumbs, actions, className = '' }) => {
    return (
        <div className={`mb-8 ${className}`}>
            {/* Breadcrumbs */}
            {breadcrumbs && (
                <div className="mb-4">
                    <BreadcrumbNavigation customItems={breadcrumbs} />
                </div>
            )}

            {/* Header Content */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                    {description && (
                        <p className="text-gray-400 text-lg">{description}</p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center space-x-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Section Header
 */
export const SectionHeader: React.FC<{
    title: string
    description?: string
    actions?: React.ReactNode
    className?: string
}> = ({ title, description, actions, className = '' }) => {
    return (
        <div className={`flex items-start justify-between mb-6 ${className}`}>
            <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
                {description && (
                    <p className="text-gray-400 text-sm">{description}</p>
                )}
            </div>

            {actions && (
                <div className="flex items-center space-x-2">
                    {actions}
                </div>
            )}
        </div>
    )
}
