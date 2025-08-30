/**
 * Glassmorphic Input Components
 * Beautiful glass effects with focus states and responsive design
 */

'use client'

import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Search, Mail, Lock, User, Phone, Calendar } from 'lucide-react'

export interface GlassmorphicInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    variant?: 'default' | 'elevated' | 'subtle' | 'premium'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ComponentType<{ className?: string }>
    iconPosition?: 'left' | 'right'
    error?: boolean
    success?: boolean
    loading?: boolean
    animated?: boolean
}

export const GlassmorphicInput = forwardRef<HTMLInputElement, GlassmorphicInputProps>(
    ({
        className = '',
        variant = 'default',
        size = 'md',
        icon: Icon,
        iconPosition = 'left',
        error = false,
        success = false,
        loading = false,
        animated = true,
        type = 'text',
        ...props
    }, ref) => {
        const [isFocused, setIsFocused] = useState(false)
        const [showPassword, setShowPassword] = useState(false)

        const baseClasses = `
            relative w-full rounded-xl
            backdrop-blur-sm border transition-all duration-300 ease-out
            placeholder:text-gray-400 placeholder:text-sm
            disabled:opacity-50 disabled:cursor-not-allowed
            ${animated ? 'transform transition-transform hover:scale-[1.01]' : ''}
        `

        const variantClasses = {
            default: `
                bg-white/10 border-white/20
                hover:bg-white/15 hover:border-white/30
                focus:bg-white/20 focus:border-white/40
            `,
            elevated: `
                bg-white/15 border-white/30
                hover:bg-white/20 hover:border-white/40
                focus:bg-white/25 focus:border-white/50
            `,
            subtle: `
                bg-white/5 border-white/10
                hover:bg-white/8 hover:border-white/20
                focus:bg-white/12 focus:border-white/30
            `,
            premium: `
                bg-gradient-to-r from-white/15 to-white/10 border-white/30
                hover:from-white/20 hover:to-white/15 hover:border-white/40
                focus:from-white/25 focus:to-white/20 focus:border-white/50
            `
        }

        const sizeClasses = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3 text-base',
            lg: 'px-5 py-4 text-lg'
        }

        const stateClasses = error
            ? 'border-red-400/50 bg-red-500/10 focus:border-red-400 focus:bg-red-500/15'
            : success
                ? 'border-green-400/50 bg-green-500/10 focus:border-green-400 focus:bg-green-500/15'
                : ''

        const focusClasses = isFocused
            ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-gray-900'
            : ''

        const inputType = type === 'password' && showPassword ? 'text' : type

        return (
            <div className="relative group">
                {/* Input Container */}
                <div className={cn(
                    baseClasses,
                    variantClasses[variant],
                    sizeClasses[size],
                    stateClasses,
                    focusClasses,
                    className
                )}>
                    {/* Left Icon */}
                    {Icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors duration-200">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}

                    {/* Input Field */}
                    <input
                        ref={ref}
                        type={inputType}
                        className={cn(
                            'w-full bg-transparent text-white outline-none',
                            'placeholder:text-gray-400',
                            Icon && iconPosition === 'left' ? 'pl-10' : '',
                            Icon && iconPosition === 'right' ? 'pr-10' : '',
                            type === 'password' ? 'pr-12' : ''
                        )}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...props}
                    />

                    {/* Right Icon or Password Toggle */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {/* Loading Spinner */}
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}

                        {/* Password Toggle */}
                        {type === 'password' && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        )}

                        {/* Right Icon */}
                        {Icon && iconPosition === 'right' && !loading && type !== 'password' && (
                            <div className="text-gray-400 group-focus-within:text-white transition-colors duration-200">
                                <Icon className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Focus Ring Effect */}
                {isFocused && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-75 -z-10" />
                )}

                {/* Success/Error Indicator */}
                {(success || error) && (
                    <div className={cn(
                        'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900',
                        success ? 'bg-green-400' : 'bg-red-400'
                    )} />
                )}
            </div>
        )
    }
)

GlassmorphicInput.displayName = 'GlassmorphicInput'

/**
 * Specialized Input Components
 */

export const GlassmorphicEmailInput = forwardRef<HTMLInputElement, Omit<GlassmorphicInputProps, 'icon' | 'type'>>(
    (props, ref) => (
        <GlassmorphicInput
            ref={ref}
            type="email"
            icon={Mail}
            iconPosition="left"
            placeholder="Enter your email address"
            {...props}
        />
    )
)

GlassmorphicEmailInput.displayName = 'GlassmorphicEmailInput'

export const GlassmorphicPasswordInput = forwardRef<HTMLInputElement, Omit<GlassmorphicInputProps, 'icon' | 'type'>>(
    (props, ref) => (
        <GlassmorphicInput
            ref={ref}
            type="password"
            icon={Lock}
            iconPosition="left"
            placeholder="Enter your password"
            {...props}
        />
    )
)

GlassmorphicPasswordInput.displayName = 'GlassmorphicPasswordInput'

export const GlassmorphicUsernameInput = forwardRef<HTMLInputElement, Omit<GlassmorphicInputProps, 'icon' | 'type'>>(
    (props, ref) => (
        <GlassmorphicInput
            ref={ref}
            type="text"
            icon={User}
            iconPosition="left"
            placeholder="Enter your username"
            {...props}
        />
    )
)

GlassmorphicUsernameInput.displayName = 'GlassmorphicUsernameInput'

export const GlassmorphicSearchInput = forwardRef<HTMLInputElement, Omit<GlassmorphicInputProps, 'icon' | 'type'>>(
    (props, ref) => (
        <GlassmorphicInput
            ref={ref}
            type="search"
            icon={Search}
            iconPosition="left"
            placeholder="Search..."
            {...props}
        />
    )
)

GlassmorphicSearchInput.displayName = 'GlassmorphicSearchInput'

export const GlassmorphicPhoneInput = forwardRef<HTMLInputElement, Omit<GlassmorphicInputProps, 'icon' | 'type'>>(
    (props, ref) => (
        <GlassmorphicInput
            ref={ref}
            type="tel"
            icon={Phone}
            iconPosition="left"
            placeholder="Enter your phone number"
            {...props}
        />
    )
)

GlassmorphicPhoneInput.displayName = 'GlassmorphicPhoneInput'

export const GlassmorphicDateInput = forwardRef<HTMLInputElement, Omit<GlassmorphicInputProps, 'icon' | 'type'>>(
    (props, ref) => (
        <GlassmorphicInput
            ref={ref}
            type="date"
            icon={Calendar}
            iconPosition="left"
            {...props}
        />
    )
)

GlassmorphicDateInput.displayName = 'GlassmorphicDateInput'

/**
 * Textarea Component
 */
export interface GlassmorphicTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    variant?: 'default' | 'elevated' | 'subtle' | 'premium'
    size?: 'sm' | 'md' | 'lg'
    error?: boolean
    success?: boolean
    animated?: boolean
    rows?: number
}

export const GlassmorphicTextarea = forwardRef<HTMLTextAreaElement, GlassmorphicTextareaProps>(
    ({
        className = '',
        variant = 'default',
        size = 'md',
        error = false,
        success = false,
        animated = true,
        rows = 4,
        ...props
    }, ref) => {
        const [isFocused, setIsFocused] = useState(false)

        const baseClasses = `
            relative w-full rounded-xl resize-none
            backdrop-blur-sm border transition-all duration-300 ease-out
            placeholder:text-gray-400 placeholder:text-sm
            disabled:opacity-50 disabled:cursor-not-allowed
            ${animated ? 'transform transition-transform hover:scale-[1.01]' : ''}
        `

        const variantClasses = {
            default: `
                bg-white/10 border-white/20
                hover:bg-white/15 hover:border-white/30
                focus:bg-white/20 focus:border-white/40
            `,
            elevated: `
                bg-white/15 border-white/30
                hover:bg-white/20 hover:border-white/40
                focus:bg-white/25 focus:border-white/50
            `,
            subtle: `
                bg-white/5 border-white/10
                hover:bg-white/8 hover:border-white/20
                focus:bg-white/12 focus:border-white/30
            `,
            premium: `
                bg-gradient-to-br from-white/15 to-white/10 border-white/30
                hover:from-white/20 hover:to-white/15 hover:border-white/40
                focus:from-white/25 focus:to-white/20 focus:border-white/50
            `
        }

        const sizeClasses = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3 text-base',
            lg: 'px-5 py-4 text-lg'
        }

        const stateClasses = error
            ? 'border-red-400/50 bg-red-500/10 focus:border-red-400 focus:bg-red-500/15'
            : success
                ? 'border-green-400/50 bg-green-500/10 focus:border-green-400 focus:bg-green-500/15'
                : ''

        const focusClasses = isFocused
            ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-gray-900'
            : ''

        return (
            <div className="relative group">
                <textarea
                    ref={ref}
                    rows={rows}
                    className={cn(
                        baseClasses,
                        variantClasses[variant],
                        sizeClasses[size],
                        stateClasses,
                        focusClasses,
                        'text-white outline-none',
                        className
                    )}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {/* Focus Ring Effect */}
                {isFocused && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-75 -z-10" />
                )}

                {/* Success/Error Indicator */}
                {(success || error) && (
                    <div className={cn(
                        'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900',
                        success ? 'bg-green-400' : 'bg-red-400'
                    )} />
                )}
            </div>
        )
    }
)

GlassmorphicTextarea.displayName = 'GlassmorphicTextarea'
