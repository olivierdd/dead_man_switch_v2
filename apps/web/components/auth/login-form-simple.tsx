/**
 * Simple Login Form Component
 * Basic login form that works with existing auth system
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthActionsHook } from '@/lib/auth'
import { loginSchema, LoginFormData } from '@/lib/validation/auth-schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    GlassmorphicForm,
    GlassmorphicFormSection,
    GlassmorphicFormField,
    GlassmorphicFormActions,
    GlassmorphicFormFooter
} from '@/components/ui/glassmorphic-form'
import {
    GlassmorphicEmailInput,
    GlassmorphicPasswordInput
} from '@/components/ui/glassmorphic-input'
import {
    GlassmorphicPrimaryButton
} from '@/components/ui/glassmorphic-button'

import { User, AlertCircle, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export interface LoginFormSimpleProps {
    className?: string
    onSuccess?: () => void
    onError?: (error: string) => void
    redirectTo?: string
    showRegistrationLink?: boolean
    showForgotPasswordLink?: boolean
    variant?: 'default' | 'elevated' | 'premium'
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const LoginFormSimple: React.FC<LoginFormSimpleProps> = ({
    className = '',
    onSuccess,
    onError,
    redirectTo = '/dashboard',
    showRegistrationLink = true,
    showForgotPasswordLink = true,
    variant = 'default',
    size = 'lg'
}) => {
    const router = useRouter()
    const { login } = useAuthActionsHook()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [generalError, setGeneralError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Form setup with react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        setError: setFormError,
        clearErrors,
        watch
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: {
            username: '',
            password: '',
            rememberMe: false
        }
    })

    // Form submission handling
    const handleFormSubmit = async (data: LoginFormData) => {
        try {
            setIsSubmitting(true)
            setGeneralError(null)
            clearErrors()

            // Attempt login
            await login({
                username: data.username,
                password: data.password
            })

            // Success handling
            onSuccess?.()
            router.push(redirectTo)

        } catch (error: any) {
            console.error('Login error:', error)

            // Handle specific error types
            if (error?.field && error?.message) {
                setFormError(error.field as keyof LoginFormData, {
                    type: 'manual',
                    message: error.message
                })
            } else if (error?.message) {
                setGeneralError(error.message)
            } else {
                setGeneralError('An unexpected error occurred. Please try again.')
            }

            onError?.(error?.message || 'Login failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const onSubmit = handleSubmit(handleFormSubmit)

    // Watch form values for real-time validation
    const watchedValues = watch()

    return (
        <div className={`glass-card p-8 ${className}`}>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome Back
                </h1>
                <p className="text-gray-400">
                    Sign in to your account to continue
                </p>
            </div>
            {/* General Error Display */}
            {generalError && (
                <div className="bg-error/20 border border-error/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-error" />
                        <span className="text-sm text-error">{generalError}</span>
                    </div>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                    <label htmlFor="username" className="block text-white font-medium mb-2">
                        Username or Email *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            {...register('username')}
                            type="text"
                            id="username"
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                            placeholder="Enter your username or email"
                        />
                    </div>
                    {errors.username?.message && (
                        <p className="text-error text-sm mt-1">{errors.username.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-white font-medium mb-2">
                        Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            {...register('password')}
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {errors.password?.message && (
                        <p className="text-error text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            {...register('rememberMe')}
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-blue focus:ring-primary-blue focus:ring-2"
                        />
                        <span className="text-sm text-gray-400">Remember me</span>
                    </label>

                    {showForgotPasswordLink && (
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-primary-blue-light hover:text-primary-blue transition-colors duration-200"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || !isValid || !isDirty}
                        className="w-full bg-gradient-to-r from-primary-blue to-primary-purple text-white font-medium px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary-blue/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Alternative Actions */}
            {showRegistrationLink && (
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-4">
                            Don't have an account?
                        </p>
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200"
                        >
                            <User className="w-4 h-4 mr-2" />
                            Create Account
                        </Link>
                    </div>
                </div>
            )}

            {/* Social Login Options (Future Enhancement) */}
            <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-4">
                        More sign-in options coming soon
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                        {/* Google */}
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer group">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>

                        {/* Microsoft */}
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer group">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                            </svg>
                        </div>

                        {/* Apple */}
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer group">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            {/* Form Footer */}
            <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="text-primary-blue-light hover:text-primary-blue">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-blue-light hover:text-primary-blue">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginFormSimple
