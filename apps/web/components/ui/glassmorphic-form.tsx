/**
 * Glassmorphic Form Container Component
 * Provides beautiful glass effects with 3D shadows and responsive design
 */

'use client'

import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface GlassmorphicFormProps {
    children: ReactNode
    className?: string
    variant?: 'default' | 'elevated' | 'subtle' | 'premium'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    animated?: boolean
    interactive?: boolean
}

export const GlassmorphicForm: React.FC<GlassmorphicFormProps> = ({
    children,
    className = '',
    variant = 'default',
    size = 'md',
    animated = true,
    interactive = true
}) => {
    const baseClasses = `
        relative overflow-hidden rounded-2xl
        backdrop-blur-xl border border-white/20
        transition-all duration-500 ease-out
        ${animated ? 'animate-in fade-in-0 slide-in-from-bottom-4' : ''}
    `

    const variantClasses = {
        default: `
            bg-white/10 shadow-lg shadow-black/20
            hover:bg-white/15 hover:shadow-xl hover:shadow-black/30
        `,
        elevated: `
            bg-white/15 shadow-2xl shadow-black/30
            hover:bg-white/20 hover:shadow-3xl hover:shadow-black/40
            border-white/30
        `,
        subtle: `
            bg-white/5 shadow-md shadow-black/10
            hover:bg-white/8 hover:shadow-lg hover:shadow-black/20
            border-white/10
        `,
        premium: `
            bg-gradient-to-br from-white/20 via-white/15 to-white/10
            shadow-2xl shadow-black/40
            hover:from-white/25 hover:via-white/20 hover:to-white/15
            hover:shadow-3xl hover:shadow-black/50
            border-white/40
        `
    }

    const sizeClasses = {
        sm: 'p-4 max-w-sm',
        md: 'p-6 max-w-md',
        lg: 'p-8 max-w-lg',
        xl: 'p-10 max-w-xl'
    }

    const interactiveClasses = interactive ? `
        cursor-pointer
        transform hover:scale-[1.02] hover:-translate-y-1
        active:scale-[0.98] active:translate-y-0
    ` : ''

    return (
        <div className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            interactiveClasses,
            className
        )}>
            {/* Glassmorphic Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />

            {/* Subtle Border Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Ambient Light Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-20 -z-10" />
        </div>
    )
}

/**
 * Glassmorphic Form Section
 */
export const GlassmorphicFormSection: React.FC<{
    children: ReactNode
    className?: string
    title?: string
    description?: string
    divider?: boolean
}> = ({ children, className = '', title, description, divider = false }) => {
    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            {(title || description) && (
                <div className="text-center space-y-2">
                    {title && (
                        <h2 className="text-xl font-semibold text-white">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-gray-300 text-sm">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {/* Divider */}
            {divider && (
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-900 text-gray-400">or</span>
                    </div>
                </div>
            )}

            {/* Content */}
            {children}
        </div>
    )
}

/**
 * Glassmorphic Form Field Container
 */
export const GlassmorphicFormField: React.FC<{
    children: ReactNode
    className?: string
    label?: string
    error?: string
    required?: boolean
    helperText?: string
}> = ({ children, className = '', label, error, required = false, helperText }) => {
    return (
        <div className={cn('space-y-2', className)}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-200">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            {/* Input */}
            {children}

            {/* Helper Text */}
            {helperText && !error && (
                <p className="text-xs text-gray-400">{helperText}</p>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-xs text-red-400 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    )
}

/**
 * Glassmorphic Form Actions
 */
export const GlassmorphicFormActions: React.FC<{
    children: ReactNode
    className?: string
    align?: 'left' | 'center' | 'right' | 'between'
}> = ({ children, className = '', align = 'center' }) => {
    const alignClasses = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
        between: 'justify-between'
    }

    return (
        <div className={cn(
            'flex items-center space-x-3',
            alignClasses[align],
            className
        )}>
            {children}
        </div>
    )
}

/**
 * Glassmorphic Form Footer
 */
export const GlassmorphicFormFooter: React.FC<{
    children: ReactNode
    className?: string
    variant?: 'default' | 'subtle'
}> = ({ children, className = '', variant = 'default' }) => {
    const variantClasses = {
        default: 'border-t border-white/10 pt-4',
        subtle: 'pt-4'
    }

    return (
        <div className={cn(
            'text-center text-sm',
            variantClasses[variant],
            className
        )}>
            {children}
        </div>
    )
}
