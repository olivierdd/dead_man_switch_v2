/**
 * Forgot Password Page
 * Password reset request form with glassmorphic design
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
    GlassmorphicInput
} from '@/components/ui/glassmorphic-input'
import {
    GlassmorphicPrimaryButton,
    GlassmorphicSecondaryButton
} from '@/components/ui/glassmorphic-button'
import { useFormValidation, useFormSubmission } from '@/lib/hooks/use-form-validation'
import { z } from 'zod'
import Link from 'next/link'

// Password reset request schema
const passwordResetRequestSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address')
})

type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>

export default function ForgotPasswordPage() {
    // Form validation setup
    const validation = useFormValidation({
        schema: passwordResetRequestSchema,
        mode: 'onBlur',
        defaultValues: {
            email: ''
        }
    })

    const { form, errors, getFieldErrorMessage, clearAllErrors } = validation
    const { register, watch } = form

    const watchedValues = watch()

    // Form submission handling
    const { submit, isSubmitting } = useFormSubmission(
        form,
        async (data: PasswordResetRequestData) => {
            console.log('Password reset request:', data)
            // TODO: Implement password reset request logic
            alert('Password reset email sent! Check console for data.')
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
                            Reset Your Password
                        </h1>
                        <p className="text-gray-400">
                            Enter your email to receive a password reset link
                        </p>
                    </div>

                    {/* Password Reset Form */}
                    <GlassmorphicForm variant="elevated" size="lg">
                        <GlassmorphicFormSection
                            title="Password Reset Request"
                            description="We'll send you a secure link to reset your password"
                        >
                            <form onSubmit={submit} className="space-y-4">
                                {/* Email Field */}
                                <GlassmorphicFormField
                                    label="Email Address"
                                    error={getFieldErrorMessage('email')}
                                    required
                                >
                                    <GlassmorphicInput
                                        {...register('email')}
                                        type="email"
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.email}
                                        success={!errors.email && watchedValues.email.length > 0}
                                        placeholder="Enter your email address"
                                    />
                                </GlassmorphicFormField>

                                {/* Form Actions */}
                                <GlassmorphicFormActions>
                                    <GlassmorphicPrimaryButton
                                        type="submit"
                                        disabled={isSubmitting}
                                        loading={isSubmitting}
                                        fullWidth
                                    >
                                        {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
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
                                    Don't have an account?{' '}
                                    <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 underline">
                                        Create one here
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
