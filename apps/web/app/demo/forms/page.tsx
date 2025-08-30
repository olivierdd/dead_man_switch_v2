/**
 * Forms Demo Page
 * Showcases the working form validation components and glassmorphic design
 */

'use client'

import React from 'react'
import { LoginFormSimple, PasswordStrengthIndicator, PasswordRequirements } from '@/components/auth'
import {
    GlassmorphicForm,
    GlassmorphicFormSection,
    GlassmorphicFormField,
    GlassmorphicFormActions,
    GlassmorphicFormFooter
} from '@/components/ui/glassmorphic-form'
import {
    GlassmorphicInput,
    GlassmorphicPasswordInput,
    GlassmorphicTextarea
} from '@/components/ui/glassmorphic-input'
import {
    GlassmorphicPrimaryButton,
    GlassmorphicSecondaryButton,
    GlassmorphicButtonGroup
} from '@/components/ui/glassmorphic-button'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Demo form schema
const demoFormSchema = z.object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
    bio: z.string().max(500, 'Bio must be 500 characters or less').optional()
})

type DemoFormData = z.infer<typeof demoFormSchema>

export default function FormsDemoPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        watch,
        setValue
    } = useForm<DemoFormData>({
        resolver: zodResolver(demoFormSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            bio: ''
        }
    })

    const watchedPassword = watch('password')
    const watchedValues = watch()

    const onSubmit = (data: DemoFormData) => {
        console.log('Form submitted:', data)
        alert('Form submitted successfully! Check console for data.')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">
                        Form Validation Demo
                    </h1>
                    <p className="text-xl text-gray-300">
                        Showcasing our glassmorphic design system and form validation
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Login Form Demo */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-white text-center">
                            Login Form
                        </h2>
                        <LoginFormSimple
                            variant="elevated"
                            size="lg"
                            onSuccess={() => alert('Login successful!')}
                            onError={(error) => alert(`Login failed: ${error}`)}
                        />
                    </div>

                    {/* Custom Form Demo */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-white text-center">
                            Custom Form
                        </h2>

                        <GlassmorphicForm variant="elevated" size="lg">
                            <GlassmorphicFormSection
                                title="Demo Form"
                                description="Try out our form components"
                            >
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    {/* Name Field */}
                                    <GlassmorphicFormField
                                        label="Full Name"
                                        error={errors.name?.message}
                                        required
                                    >
                                        <GlassmorphicInput
                                            {...register('name')}
                                            variant="elevated"
                                            size="md"
                                            error={!!errors.name}
                                            success={!errors.name && watchedValues.name.length > 0}
                                            placeholder="Enter your full name"
                                        />
                                    </GlassmorphicFormField>

                                    {/* Email Field */}
                                    <GlassmorphicFormField
                                        label="Email Address"
                                        error={errors.email?.message}
                                        required
                                    >
                                        <GlassmorphicInput
                                            {...register('email')}
                                            type="email"
                                            variant="elevated"
                                            size="md"
                                            error={!!errors.email}
                                            success={!errors.email && watchedValues.email.length > 0}
                                            placeholder="Enter your email"
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
                                            placeholder="Enter your password"
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

                                    {/* Bio Field */}
                                    <GlassmorphicFormField
                                        label="Bio"
                                        error={errors.bio?.message}
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

                                    {/* Form Actions */}
                                    <GlassmorphicFormActions>
                                        <GlassmorphicButtonGroup>
                                            <GlassmorphicSecondaryButton
                                                type="button"
                                                onClick={() => {
                                                    setValue('name', 'John Doe')
                                                    setValue('email', 'john@example.com')
                                                    setValue('password', 'TestPass123!')
                                                    setValue('bio', 'This is a demo bio to show the form in action.')
                                                }}
                                            >
                                                Fill Demo Data
                                            </GlassmorphicSecondaryButton>
                                            <GlassmorphicPrimaryButton
                                                type="submit"
                                                disabled={!isValid || !isDirty}
                                            >
                                                Submit Form
                                            </GlassmorphicPrimaryButton>
                                        </GlassmorphicButtonGroup>
                                    </GlassmorphicFormActions>
                                </form>
                            </GlassmorphicFormSection>
                        </GlassmorphicForm>
                    </div>
                </div>

                {/* Component Showcase */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white text-center">
                        Component Showcase
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Password Requirements */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white text-center">
                                Password Requirements
                            </h3>
                            <PasswordRequirements showIcons={true} />
                        </div>

                        {/* Button Variants */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white text-center">
                                Button Variants
                            </h3>
                            <div className="space-y-3">
                                <GlassmorphicPrimaryButton size="sm" fullWidth>
                                    Primary Button
                                </GlassmorphicPrimaryButton>
                                <GlassmorphicSecondaryButton size="sm" fullWidth>
                                    Secondary Button
                                </GlassmorphicSecondaryButton>
                                <GlassmorphicButtonGroup>
                                    <GlassmorphicPrimaryButton size="xs">
                                        Small
                                    </GlassmorphicPrimaryButton>
                                    <GlassmorphicSecondaryButton size="xs">
                                        Small
                                    </GlassmorphicSecondaryButton>
                                </GlassmorphicButtonGroup>
                            </div>
                        </div>

                        {/* Input Variants */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white text-center">
                                Input Variants
                            </h3>
                            <div className="space-y-3">
                                <GlassmorphicInput
                                    placeholder="Default input"
                                    variant="default"
                                    size="sm"
                                />
                                <GlassmorphicInput
                                    placeholder="Elevated input"
                                    variant="elevated"
                                    size="sm"
                                />
                                <GlassmorphicInput
                                    placeholder="Premium input"
                                    variant="premium"
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
