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
import { Checkbox } from '@/components/ui/checkbox'
import { User, AlertCircle, ArrowRight } from 'lucide-react'

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
        <GlassmorphicForm
            variant={variant}
            size={size}
            className={className}
            animated={true}
            interactive={false}
        >
            <GlassmorphicFormSection
                title="Welcome Back"
                description="Sign in to your account to continue"
            >
                {/* General Error Display */}
                {generalError && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-400">{generalError}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Username Field */}
                    <GlassmorphicFormField
                        label="Username or Email"
                        error={errors.username?.message}
                        required
                    >
                        <GlassmorphicEmailInput
                            {...register('username')}
                            variant="elevated"
                            size="md"
                            error={!!errors.username}
                            success={!errors.username && watchedValues.username && watchedValues.username.length > 0 ? true : false}
                            className="w-full"
                            placeholder="Enter your username or email"
                        />
                    </GlassmorphicFormField>

                    {/* Password Field */}
                    <GlassmorphicFormField
                        label="Password"
                        error={errors.password?.message}
                        required
                    >
                        <GlassmorphicPasswordInput
                            {...register('password')}
                            variant="elevated"
                            size="md"
                            error={!!errors.password}
                            success={!errors.password && watchedValues.password.length > 0}
                            className="w-full"
                        />
                    </GlassmorphicFormField>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                                {...register('rememberMe')}
                                className="rounded border-white/20 bg-white/10"
                            />
                            <span className="text-sm text-gray-300">Remember me</span>
                        </label>

                        {showForgotPasswordLink && (
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button */}
                    <GlassmorphicFormActions>
                        <GlassmorphicPrimaryButton
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={isSubmitting}
                            loadingText="Signing in..."
                            className="mt-4"
                            disabled={!isValid || !isDirty}
                        >
                            Sign In
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </GlassmorphicPrimaryButton>
                    </GlassmorphicFormActions>
                </form>

                {/* Alternative Actions */}
                {showRegistrationLink && (
                    <GlassmorphicFormSection divider>
                        <div className="text-center">
                            <p className="text-sm text-gray-400 mb-3">
                                Don't have an account?
                            </p>
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Create Account
                            </Link>
                        </div>
                    </GlassmorphicFormSection>
                )}

                {/* Social Login Options (Future Enhancement) */}
                <GlassmorphicFormSection>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-3">
                            More sign-in options coming soon
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                <span className="text-xs text-gray-400">G</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                <span className="text-xs text-gray-400">M</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                <span className="text-xs text-gray-400">G</span>
                            </div>
                        </div>
                    </div>
                </GlassmorphicFormSection>
            </GlassmorphicFormSection>

            {/* Form Footer */}
            <GlassmorphicFormFooter variant="subtle">
                <p className="text-xs text-gray-500">
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                        Privacy Policy
                    </Link>
                </p>
            </GlassmorphicFormFooter>
        </GlassmorphicForm>
    )
}

export default LoginFormSimple
