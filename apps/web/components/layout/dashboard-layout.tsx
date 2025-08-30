/**
 * Dashboard Layout Component
 * Combines sidebar navigation, main navigation, and content area
 */

'use client'

import React, { useState } from 'react'
import { MainNavigation } from './main-navigation'
import { SidebarNavigation } from './sidebar-navigation'
import { BreadcrumbNavigation } from './breadcrumb-navigation'

export interface DashboardLayoutProps {
    children: React.ReactNode
    className?: string
    showSidebar?: boolean
    showBreadcrumbs?: boolean
    sidebarCollapsed?: boolean
    onSidebarToggle?: (collapsed: boolean) => void
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    className = '',
    showSidebar = true,
    showBreadcrumbs = true,
    sidebarCollapsed = false,
    onSidebarToggle
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(sidebarCollapsed)

    const handleSidebarToggle = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed)
        onSidebarToggle?.(collapsed)
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Main Navigation */}
            <MainNavigation />

            <div className="flex">
                {/* Sidebar Navigation */}
                {showSidebar && (
                    <SidebarNavigation
                        collapsed={isSidebarCollapsed}
                        onToggleCollapse={handleSidebarToggle}
                    />
                )}

                {/* Main Content Area */}
                <main className={`
                    flex-1 min-h-screen transition-all duration-300 ease-in-out
                    ${showSidebar ? (isSidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}
                    ${className}
                `}>
                    {/* Content Container */}
                    <div className="p-6">
                        {/* Breadcrumbs */}
                        {showBreadcrumbs && (
                            <div className="mb-6">
                                <BreadcrumbNavigation />
                            </div>
                        )}

                        {/* Page Content */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

/**
 * Simple Layout without Sidebar
 */
export const SimpleLayout: React.FC<{
    children: React.ReactNode
    className?: string
    showBreadcrumbs?: boolean
}> = ({ children, className = '', showBreadcrumbs = true }) => {
    return (
        <div className="min-h-screen bg-gray-900">
            <MainNavigation />

            <main className={`flex-1 min-h-screen ${className}`}>
                <div className="p-6">
                    {showBreadcrumbs && (
                        <div className="mb-6">
                            <BreadcrumbNavigation />
                        </div>
                    )}

                    {children}
                </div>
            </main>
        </div>
    )
}

/**
 * Admin Layout with Enhanced Sidebar
 */
export const AdminLayout: React.FC<{
    children: React.ReactNode
    className?: string
    showBreadcrumbs?: boolean
}> = ({ children, className = '', showBreadcrumbs = true }) => {
    return (
        <DashboardLayout
            showSidebar={true}
            showBreadcrumbs={showBreadcrumbs}
            className={className}
        >
            {children}
        </DashboardLayout>
    )
}

/**
 * Writer Layout with Content-Focused Sidebar
 */
export const WriterLayout: React.FC<{
    children: React.ReactNode
    className?: string
    showBreadcrumbs?: boolean
}> = ({ children, className = '', showBreadcrumbs = true }) => {
    return (
        <DashboardLayout
            showSidebar={true}
            showBreadcrumbs={showBreadcrumbs}
            className={className}
        >
            {children}
        </DashboardLayout>
    )
}

/**
 * Reader Layout with Simplified Sidebar
 */
export const ReaderLayout: React.FC<{
    children: React.ReactNode
    className?: string
    showBreadcrumbs?: boolean
}> = ({ children, className = '', showBreadcrumbs = true }) => {
    return (
        <DashboardLayout
            showSidebar={true}
            showBreadcrumbs={showBreadcrumbs}
            className={className}
        >
            {children}
        </DashboardLayout>
    )
}
