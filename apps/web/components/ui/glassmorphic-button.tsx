/**
 * Glassmorphic Button Components
 * Beautiful glass effects with loading states and responsive design
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface GlassmorphicButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'elevated' | 'subtle' | 'premium' | 'gradient' | 'outline'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    loading?: boolean
    loadingText?: string
    icon?: React.ComponentType<{ className?: string }>
    iconPosition?: 'left' | 'right'
    fullWidth?: boolean
    animated?: boolean
    glassEffect?: boolean
}

export const GlassmorphicButton = forwardRef<HTMLButtonElement, GlassmorphicButtonProps>(
    ({
        className = '',
        variant = 'default',
        size = 'md',
        loading = false,
        loadingText,
        icon: Icon,
        iconPosition = 'left',
        fullWidth = false,
        animated = true,
        glassEffect = true,
        children,
        disabled,
        ...props
    }, ref) => {
        const isDisabled = disabled || loading

        const baseClasses = `
            relative inline-flex items-center justify-center
            font-medium rounded-xl transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${fullWidth ? 'w-full' : ''}
            ${animated ? 'transform transition-transform hover:scale-[1.02] active:scale-[0.98]' : ''}
        `

        const variantClasses = {
            default: `
                bg-white/10 text-white border border-white/20
                hover:bg-white/20 hover:border-white/30
                focus:ring-white/20
                ${glassEffect ? 'backdrop-blur-sm shadow-lg shadow-black/20' : ''}
            `,
            elevated: `
                bg-white/15 text-white border border-white/30
                hover:bg-white/25 hover:border-white/40
                focus:ring-white/30
                ${glassEffect ? 'backdrop-blur-sm shadow-xl shadow-black/30' : ''}
            `,
            subtle: `
                bg-white/5 text-white border border-white/10
                hover:bg-white/10 hover:border-white/20
                focus:ring-white/20
                ${glassEffect ? 'backdrop-blur-sm shadow-md shadow-black/10' : ''}
            `,
            premium: `
                bg-gradient-to-r from-white/20 via-white/15 to-white/10 text-white border border-white/30
                hover:from-white/25 hover:via-white/20 hover:to-white/15 hover:border-white/40
                focus:ring-white/30
                ${glassEffect ? 'backdrop-blur-sm shadow-2xl shadow-black/40' : ''}
            `,
            gradient: `
                bg-gradient-to-r from-primary-blue to-primary-purple text-white border border-transparent
                hover:from-primary-blue-dark hover:to-primary-purple-dark
                focus:ring-primary-blue/30
                shadow-lg shadow-primary-blue/25
            `,
            outline: `
                bg-transparent text-white border border-white/30
                hover:bg-white/10 hover:border-white/40
                focus:ring-white/30
                ${glassEffect ? 'backdrop-blur-sm' : ''}
            `
        }

        const sizeClasses = {
            xs: 'px-2 py-1 text-xs',
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
            xl: 'px-8 py-4 text-lg'
        }

        const iconSizeClasses = {
            xs: 'w-3 h-3',
            sm: 'w-4 h-4',
            md: 'w-4 h-4',
            lg: 'w-5 h-5',
            xl: 'w-6 h-6'
        }

        const iconSpacingClasses = {
            xs: 'space-x-1',
            sm: 'space-x-2',
            md: 'space-x-2',
            lg: 'space-x-3',
            xl: 'space-x-3'
        }

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={cn(
                    baseClasses,
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {/* Glassmorphic Background Effects */}
                {glassEffect && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-xl" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />
                    </>
                )}

                {/* Content Container */}
                <div className={cn(
                    'relative z-10 flex items-center',
                    iconSpacingClasses[size]
                )}>
                    {/* Left Icon */}
                    {Icon && iconPosition === 'left' && !loading && (
                        <Icon className={iconSizeClasses[size]} />
                    )}

                    {/* Loading Spinner */}
                    {loading && (
                        <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
                    )}

                    {/* Button Text */}
                    <span>
                        {loading && loadingText ? loadingText : children}
                    </span>

                    {/* Right Icon */}
                    {Icon && iconPosition === 'right' && !loading && (
                        <Icon className={iconSizeClasses[size]} />
                    )}
                </div>

                {/* Ambient Light Effect */}
                {glassEffect && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-blue/20 via-primary-purple/20 to-pink-500/20 rounded-xl blur-xl opacity-20 -z-10" />
                )}
            </button>
        )
    }
)

GlassmorphicButton.displayName = 'GlassmorphicButton'

/**
 * Specialized Button Components
 */

export const GlassmorphicPrimaryButton = forwardRef<HTMLButtonElement, Omit<GlassmorphicButtonProps, 'variant'>>(
    (props, ref) => (
        <GlassmorphicButton
            ref={ref}
            variant="gradient"
            {...props}
        />
    )
)

GlassmorphicPrimaryButton.displayName = 'GlassmorphicPrimaryButton'

export const GlassmorphicSecondaryButton = forwardRef<HTMLButtonElement, Omit<GlassmorphicButtonProps, 'variant'>>(
    (props, ref) => (
        <GlassmorphicButton
            ref={ref}
            variant="elevated"
            {...props}
        />
    )
)

GlassmorphicSecondaryButton.displayName = 'GlassmorphicSecondaryButton'

export const GlassmorphicGhostButton = forwardRef<HTMLButtonElement, Omit<GlassmorphicButtonProps, 'variant'>>(
    (props, ref) => (
        <GlassmorphicButton
            ref={ref}
            variant="outline"
            {...props}
        />
    )
)

GlassmorphicGhostButton.displayName = 'GlassmorphicGhostButton'

export const GlassmorphicIconButton = forwardRef<HTMLButtonElement, Omit<GlassmorphicButtonProps, 'variant' | 'size'> & {
    icon: React.ComponentType<{ className?: string }>
    size?: 'sm' | 'md' | 'lg'
}>(({ icon: Icon, size = 'md', className = '', children, ...props }, ref) => {
    const sizeClasses = {
        sm: 'p-2',
        md: 'p-3',
        lg: 'p-4'
    }

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    }

    return (
        <GlassmorphicButton
            ref={ref}
            variant="subtle"
            size="sm"
            className={cn(sizeClasses[size], 'aspect-square', className)}
            {...props}
        >
            <Icon className={iconSizeClasses[size]} />
            {children}
        </GlassmorphicButton>
    )
})

GlassmorphicIconButton.displayName = 'GlassmorphicIconButton'

/**
 * Button Group Component
 */
export const GlassmorphicButtonGroup: React.FC<{
    children: React.ReactNode
    className?: string
    orientation?: 'horizontal' | 'vertical'
    size?: 'sm' | 'md' | 'lg'
}> = ({ children, className = '', orientation = 'horizontal', size = 'md' }) => {
    const orientationClasses = {
        horizontal: 'flex-row',
        vertical: 'flex-col'
    }

    const sizeClasses = {
        sm: 'space-x-1',
        md: 'space-x-2',
        lg: 'space-x-3'
    }

    const verticalSizeClasses = {
        sm: 'space-y-1',
        md: 'space-y-2',
        lg: 'space-y-3'
    }

    return (
        <div className={cn(
            'flex',
            orientationClasses[orientation],
            orientation === 'horizontal' ? sizeClasses[size] : verticalSizeClasses[size],
            className
        )}>
            {children}
        </div>
    )
}

/**
 * Loading Button Component
 */
export const GlassmorphicLoadingButton: React.FC<{
    loading?: boolean
    loadingText?: string
    children: React.ReactNode
    className?: string
    variant?: GlassmorphicButtonProps['variant']
    size?: GlassmorphicButtonProps['size']
    disabled?: boolean
    onClick?: () => void
}> = ({
    loading = false,
    loadingText = 'Loading...',
    children,
    className = '',
    variant = 'default',
    size = 'md',
    disabled = false,
    onClick
}) => {
        return (
            <GlassmorphicButton
                variant={variant}
                size={size}
                loading={loading}
                loadingText={loadingText}
                disabled={disabled || loading}
                onClick={onClick}
                className={className}
            >
                {children}
            </GlassmorphicButton>
        )
    }
