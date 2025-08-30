/**
 * Registration Page
 * User registration page with glassmorphic design
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
    GlassmorphicPrimaryButton,
    GlassmorphicSecondaryButton
} from '@/components/ui/glassmorphic-button'
import { PasswordStrengthIndicator, PasswordRequirements } from '@/components/auth'
import { useFormValidation, useFormSubmission } from '@/lib/hooks/use-form-validation'
import { z } from 'zod'
import Link from 'next/link'

// Registration form schema
const registrationSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    username: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters'),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
    acceptPrivacy: z.boolean().refine((val) => val === true, 'You must accept the privacy policy')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export default function RegisterPage() {
    // Form validation setup
    const validation = useFormValidation({
        schema: registrationSchema,
        mode: 'onBlur',
        defaultValues: {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
            acceptPrivacy: false
        }
    })

    const { form, errors, hasErrors, getFieldErrorMessage, clearAllErrors } = validation
    const { register, handleSubmit, watch, setValue } = form

    const watchedPassword = watch('password')
    const watchedValues = watch()

    // Form submission handling
    const { submit, isSubmitting } = useFormSubmission(
        form,
        async (data: RegistrationFormData) => {
            console.log('Registration data:', data)
            // TODO: Implement registration logic
            alert('Registration form submitted! Check console for data.')
        },
        (error) => {
            console.error('Registration error:', error)
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
                            Create Your Account
                        </h1>
                        <p className="text-gray-400">
                            Start securing your secrets today
                        </p>
                    </div>

                    {/* Registration Form */}
                    <GlassmorphicForm variant="elevated" size="lg">
                        <GlassmorphicFormSection
                            title="Account Information"
                            description="Enter your details to create your account"
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

                                {/* Username Field */}
                                <GlassmorphicFormField
                                    label="Username"
                                    error={getFieldErrorMessage('username')}
                                    required
                                >
                                    <GlassmorphicInput
                                        {...register('username')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.username}
                                        success={!errors.username && watchedValues.username.length > 0}
                                        placeholder="Choose a username"
                                    />
                                </GlassmorphicFormField>

                                {/* Password Field */}
                                <GlassmorphicFormField
                                    label="Password"
                                    error={getFieldErrorMessage('password')}
                                    required
                                >
                                    <GlassmorphicPasswordInput
                                        {...register('password')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.password}
                                        success={!errors.password && watchedValues.password.length > 0}
                                        placeholder="Create a strong password"
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
                                    label="Confirm Password"
                                    error={getFieldErrorMessage('confirmPassword')}
                                    required
                                >
                                    <GlassmorphicPasswordInput
                                        {...register('confirmPassword')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.confirmPassword}
                                        success={!errors.confirmPassword && watchedValues.confirmPassword.length > 0}
                                        placeholder="Confirm your password"
                                    />
                                </GlassmorphicFormField>

                                {/* Password Requirements */}
                                <div className="mt-4">
                                    <PasswordRequirements showIcons={true} />
                                </div>

                                {/* Terms and Privacy */}
                                <div className="space-y-3">
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('acceptTerms')}
                                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-300">
                                            I accept the{' '}
                                            <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                                                Terms and Conditions
                                            </Link>
                                        </span>
                                    </label>
                                    {errors.acceptTerms && (
                                        <p className="text-red-400 text-sm">{errors.acceptTerms.message}</p>
                                    )}

                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('acceptPrivacy')}
                                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-300">
                                            I accept the{' '}
                                            <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </label>
                                    {errors.acceptPrivacy && (
                                        <p className="text-red-400 text-sm">{errors.acceptPrivacy.message}</p>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <GlassmorphicFormActions>
                                    <GlassmorphicPrimaryButton
                                        type="submit"
                                        disabled={isSubmitting}
                                        loading={isSubmitting}
                                        fullWidth
                                    >
                                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                    </GlassmorphicPrimaryButton>
                                </GlassmorphicFormActions>
                            </form>
                        </GlassmorphicFormSection>

                        {/* Form Footer */}
                        <GlassmorphicFormFooter variant="subtle">
                            <div className="text-center">
                                <p className="text-gray-400">
                                    Already have an account?{' '}
                                    <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
                                        Sign in here
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
