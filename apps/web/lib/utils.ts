import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Role-based utility functions
export function hasRole(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
        'reader': 1,
        'writer': 2,
        'admin': 3
    }

    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy]
}

export function canAccessResource(userRole: string, resourceOwnerId: string, userId: string): boolean {
    return userRole === 'admin' || userId === resourceOwnerId
}

// Formatting utilities
export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export function formatDateTime(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function formatRelativeTime(date: Date | string): string {
    const now = new Date()
    const d = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return formatDate(d)
}

// Security utilities
export function generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, '')
}

// Validation utilities
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
}

// UI utilities
export function getRoleColor(role: string): string {
    const colors = {
        'admin': 'purple',
        'writer': 'blue',
        'reader': 'green'
    }
    return colors[role as keyof typeof colors] || 'gray'
}

export function getRoleIcon(role: string): string {
    const icons = {
        'admin': '👑',
        'writer': '✍️',
        'reader': '👁️'
    }
    return icons[role as keyof typeof icons] || '👤'
}

