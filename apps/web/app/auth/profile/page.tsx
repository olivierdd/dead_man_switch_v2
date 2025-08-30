/**
 * Profile Update Page
 * User profile update form with glassmorphic design
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
    GlassmorphicTextarea
} from '@/components/ui/glassmorphic-input'
import {
    GlassmorphicPrimaryButton,
    GlassmorphicSecondaryButton
} from '@/components/ui/glassmorphic-button'
import { useFormValidation, useFormSubmission } from '@/lib/hooks/use-form-validation'
import { z } from 'zod'
import Link from 'next/link'

// Profile update schema
const profileUpdateSchema = z.object({
    displayName: z.string().min(1, 'Display name is required').min(2, 'Display name must be at least 2 characters'),
    bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
    avatarUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    timezone: z.string().optional(),
    language: z.string().optional()
})

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>

export default function ProfilePage() {
    // Form validation setup
    const validation = useFormValidation({
        schema: profileUpdateSchema,
        mode: 'onBlur',
        defaultValues: {
            displayName: 'John Doe',
            bio: 'This is a sample bio for demonstration purposes.',
            avatarUrl: '',
            timezone: 'UTC',
            language: 'en'
        }
    })

    const { form, errors, getFieldErrorMessage, clearAllErrors } = validation
    const { register, watch, setValue } = form

    const watchedValues = watch()

    // Form submission handling
    const { submit, isSubmitting } = useFormSubmission(
        form,
        async (data: ProfileUpdateData) => {
            console.log('Profile update data:', data)
            // TODO: Implement profile update logic
            alert('Profile updated successfully! Check console for data.')
        },
        (error) => {
            console.error('Profile update error:', error)
        }
    )

    // Demo data button handler
    const fillDemoData = () => {
        setValue('displayName', 'Jane Smith')
        setValue('bio', 'Updated bio with new information about my role and interests.')
        setValue('avatarUrl', 'https://example.com/avatar.jpg')
        setValue('timezone', 'America/New_York')
        setValue('language', 'en')
    }

    return (
        <div className="relative min-h-screen">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Update Your Profile
                        </h1>
                        <p className="text-gray-400">
                            Keep your information up to date
                        </p>
                    </div>

                    {/* Profile Update Form */}
                    <GlassmorphicForm variant="elevated" size="lg">
                        <GlassmorphicFormSection
                            title="Personal Information"
                            description="Update your profile details and preferences"
                        >
                            <form onSubmit={submit} className="space-y-4">
                                {/* Display Name Field */}
                                <GlassmorphicFormField
                                    label="Display Name"
                                    error={getFieldErrorMessage('displayName')}
                                    required
                                >
                                    <GlassmorphicInput
                                        {...register('displayName')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.displayName}
                                        success={!errors.displayName && watchedValues.displayName.length > 0}
                                        placeholder="Enter your display name"
                                    />
                                </GlassmorphicFormField>

                                {/* Bio Field */}
                                <GlassmorphicFormField
                                    label="Bio"
                                    error={getFieldErrorMessage('bio')}
                                    helperText="Tell us about yourself (optional)"
                                >
                                    <GlassmorphicTextarea
                                        {...register('bio')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.bio}
                                        rows={3}
                                        placeholder="Share something about yourself..."
                                    />
                                </GlassmorphicFormField>

                                {/* Avatar URL Field */}
                                <GlassmorphicFormField
                                    label="Avatar URL"
                                    error={getFieldErrorMessage('avatarUrl')}
                                    helperText="Link to your profile picture (optional)"
                                >
                                    <GlassmorphicInput
                                        {...register('avatarUrl')}
                                        type="url"
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.avatarUrl}
                                        success={!errors.avatarUrl && watchedValues.avatarUrl.length > 0}
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </GlassmorphicFormField>

                                {/* Timezone Field */}
                                <GlassmorphicFormField
                                    label="Timezone"
                                    error={getFieldErrorMessage('timezone')}
                                    helperText="Your local timezone for notifications"
                                >
                                    <GlassmorphicInput
                                        {...register('timezone')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.timezone}
                                        success={!errors.timezone && watchedValues.timezone.length > 0}
                                        placeholder="e.g., UTC, America/New_York"
                                    />
                                </GlassmorphicFormField>

                                {/* Language Field */}
                                <GlassmorphicFormField
                                    label="Language"
                                    error={getFieldErrorMessage('language')}
                                    helperText="Preferred language for the interface"
                                >
                                    <GlassmorphicInput
                                        {...register('language')}
                                        variant="elevated"
                                        size="md"
                                        error={!!errors.language}
                                        success={!errors.language && watchedValues.language.length > 0}
                                        placeholder="e.g., en, fr, es"
                                    />
                                </GlassmorphicFormField>

                                {/* Form Actions */}
                                <GlassmorphicFormActions>
                                    <GlassmorphicSecondaryButton
                                        type="button"
                                        onClick={fillDemoData}
                                        disabled={isSubmitting}
                                    >
                                        Fill Demo Data
                                    </GlassmorphicSecondaryButton>
                                    <GlassmorphicPrimaryButton
                                        type="submit"
                                        disabled={isSubmitting}
                                        loading={isSubmitting}
                                    >
                                        {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
                                    </GlassmorphicPrimaryButton>
                                </GlassmorphicFormActions>
                            </form>
                        </GlassmorphicFormSection>

                        {/* Form Footer */}
                        <GlassmorphicFormFooter variant="subtle">
                            <div className="text-center space-y-4">
                                <p className="text-gray-400">
                                    Want to change your password?{' '}
                                    <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 underline">
                                        Reset it here
                                    </Link>
                                </p>
                                <p className="text-gray-400">
                                    Back to{' '}
                                    <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 underline">
                                        Dashboard
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
