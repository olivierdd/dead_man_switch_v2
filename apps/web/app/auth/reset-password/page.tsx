/**
 * Reset Password Page
 * Password reset confirmation form with glassmorphic design
 */

'use client'

import React from 'react'
import { ParticleBackground } from '@/components/three/ParticleBackground'
import {
    GlassmorphicForm,
    GlassmorphicFormSection,
    GlassmorphicFormField,
    GlassmorphicFormActions,
    GlassmorphicFormFooter
} from '@/components/ui/glassmorphic-form'
import {
    GlassmorphicInput,
    GlassmorphicPasswordInput
} from '@/components/ui/glassmorphic-input'
import {
    GlassmorphicPrimaryButton
} from '@/components/ui/glassmorphic-button'
import { PasswordStrengthIndicator, PasswordRequirements } from '@/components/auth'
import { useFormValidation, useFormSubmission } from '@/lib/hooks/use-form-validation'
import { z } from 'zod'
import Link from 'next/link'

// Password reset confirmation schema
const passwordResetSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type PasswordResetData = z.infer<typeof passwordResetSchema>

export default function ResetPasswordPage() {
    // Form validation setup
    const validation = useFormValidation({
        schema: passwordResetSchema,
        mode: 'onBlur',
        defaultValues: {
            token: '',
            password: '',
            confirmPassword: ''
        }
    })

    const { form, errors, getFieldErrorMessage, clearAllErrors } = validation
    const { register, watch } = form

    const watchedPassword = watch('password')
    const watchedValues = watch()

    // Form submission handling
    const { submit, isSubmitting } = useFormSubmission(
        form,
        async (data: PasswordResetData) => {
            console.log('Password reset data:', data)
            // TODO: Implement password reset logic
            alert('Password reset successful! Check console for data.')
        },
        (error) => {
            console.error('Password reset error:', error)
        }
    )

    return (
        <div className="relative min-h-screen">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Set New Password
                        </h1>
                        <p className="text-gray-400">
                            Enter your new password below
                        </p>
                    </div>

                    {/* Password Reset Form */}
                    <GlassmorphicForm variant="elevated" size="lg">
                        <GlassmorphicFormSection
                            title="New Password"
                            description="Choose a strong, secure password"
                        >
                            <form onSubmit={submit} className="space-y-4">
                                {/* Token Field (hidden, populated from URL) */}
                                <input
                                    type="hidden"
                                    {...register('token')}
                                />

                                {/* Password Field */}
                                <GlassmorphicFormField
                                    label="New Password"
                                    error={getFieldErrorMessage('password')}
                                    required
                                >
                                    <GlassmorphicPasswordInput
                                        {...register('password')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.password}
                                        success={!errors.password && watchedValues.password.length > 0}
                                        placeholder="Enter your new password"
                                    />
                                </GlassmorphicFormField>

                                {/* Password Strength Indicator */}
                                {watchedPassword && (
                                    <div className="mt-2">
                                        <PasswordStrengthIndicator
                                            password={watchedPassword}
                                            variant="detailed"
                                            showSuggestions={true}
                                            showScore={true}
                                        />
                                    </div>
                                )}

                                {/* Confirm Password Field */}
                                <GlassmorphicFormField
                                    label="Confirm New Password"
                                    error={getFieldErrorMessage('confirmPassword')}
                                    required
                                >
                                    <GlassmorphicPasswordInput
                                        {...register('confirmPassword')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.confirmPassword}
                                        success={!errors.confirmPassword && watchedValues.confirmPassword.length > 0}
                                        placeholder="Confirm your new password"
                                    />
                                </GlassmorphicFormField>

                                {/* Password Requirements */}
                                <div className="mt-4">
                                    <PasswordRequirements showIcons={true} />
                                </div>

                                {/* Form Actions */}
                                <GlassmorphicFormActions>
                                    <GlassmorphicPrimaryButton
                                        type="submit"
                                        disabled={isSubmitting}
                                        loading={isSubmitting}
                                        fullWidth
                                    >
                                        {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                                    </GlassmorphicPrimaryButton>
                                </GlassmorphicFormActions>
                            </form>
                        </GlassmorphicFormSection>

                        {/* Form Footer */}
                        <GlassmorphicFormFooter variant="subtle">
                            <div className="text-center space-y-4">
                                <p className="text-gray-400">
                                    Remember your password?{' '}
                                    <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
                                        Sign in here
                                    </Link>
                                </p>
                                <p className="text-gray-400">
                                    Need another reset link?{' '}
                                    <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 underline">
                                        Request one here
                                    </Link>
                                </p>
                            </div>
                        </GlassmorphicFormFooter>
                    </GlassmorphicForm>
                </div>
            </div>
        </div>
    )
}
