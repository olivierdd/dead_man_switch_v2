/**
 * Registration Page
 * User registration page with glassmorphic design
 */

'use client'

import React, { useState } from 'react'
import { ParticleBackground } from '@/components/three/ParticleBackground'
import { PasswordStrengthIndicator } from '@/components/auth'
import { useFormValidation, useFormSubmission } from '@/lib/hooks/use-form-validation'
import { useAuthActions } from '@/lib/auth/auth-hooks'
import { z } from 'zod'
import Link from 'next/link'
import { Mail, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

// Registration form schema
const registrationSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    display_name: z.string().min(2, 'Display name must be at least 2 characters'),
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
    acceptPrivacy: z.boolean().refine((val) => val === true, 'You must accept the privacy policy')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export default function RegisterPage() {
    // Password visibility states
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)

    // Auth actions
    const { register: registerUser } = useAuthActions()

    // Form validation setup
    const validation = useFormValidation({
        schema: registrationSchema,
        mode: 'onBlur',
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            first_name: '',
            last_name: '',
            display_name: '',
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
            try {
                console.log('Registration data:', {
                    email: data.email,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    display_name: data.display_name,
                    // Password intentionally omitted for security
                })

                // Call the backend API
                const response = await registerUser({
                    email: data.email,
                    password: data.password,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    display_name: data.display_name,
                    role: 'writer' // Default role
                })

                console.log('Registration successful:', response)
                setRegistrationSuccess(true)

                // Clear form
                clearAllErrors()

            } catch (error: any) {
                console.error('Registration error:', error)

                // Handle specific backend errors
                if (error.response?.data?.detail) {
                    const errorDetail = error.response.data.detail

                    // Handle duplicate email error
                    if (errorDetail === 'Email already registered') {
                        form.setError('email', {
                            type: 'manual',
                            message: 'This email address is already registered. Please use a different email or try signing in.'
                        })
                        return
                    }

                    // Handle other validation errors
                    if (Array.isArray(errorDetail)) {
                        errorDetail.forEach((err: any) => {
                            if (err.loc && err.loc.length > 1) {
                                const field = err.loc[1] // Get the field name
                                form.setError(field as any, {
                                    type: 'manual',
                                    message: err.msg || 'Validation error'
                                })
                            }
                        })
                        return
                    }

                    // Handle general error messages
                    form.setError('root', {
                        type: 'manual',
                        message: errorDetail
                    })
                    return
                }

                // Handle network or other errors
                form.setError('root', {
                    type: 'manual',
                    message: 'Registration failed. Please check your connection and try again.'
                })
            }
        },
        (error) => {
            console.error('Registration error:', error)
            // Error will be displayed by the form validation system
        }
    )

    return (
        <div className="relative min-h-screen">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    {/* Registration Form */}
                    <div className="glass-card p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {registrationSuccess ? 'Account Created!' : 'Create Your Account'}
                            </h1>
                            <p className="text-gray-400">
                                {registrationSuccess
                                    ? 'Your account has been created successfully. Please check your email for verification instructions.'
                                    : 'Enter your details to create your account'
                                }
                            </p>
                        </div>
                        {!registrationSuccess ? (
                            <form onSubmit={submit} className="space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-white font-medium mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            {...register('email')}
                                            type="email"
                                            id="email"
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-error text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Display Name Field */}
                                <div>
                                    <label htmlFor="display_name" className="block text-white font-medium mb-2">
                                        Display Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            {...register('display_name')}
                                            type="text"
                                            id="display_name"
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="Choose a display name"
                                        />
                                    </div>
                                    {errors.display_name && (
                                        <p className="text-error text-sm mt-1">{errors.display_name.message}</p>
                                    )}
                                </div>

                                {/* First and Last Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="first_name" className="block text-white font-medium mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            {...register('first_name')}
                                            type="text"
                                            id="first_name"
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="First name"
                                        />
                                        {errors.first_name && (
                                            <p className="text-error text-sm mt-1">{errors.first_name.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="last_name" className="block text-white font-medium mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            {...register('last_name')}
                                            type="text"
                                            id="last_name"
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="Last name"
                                        />
                                        {errors.last_name && (
                                            <p className="text-error text-sm mt-1">{errors.last_name.message}</p>
                                        )}
                                    </div>
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
                                            placeholder="Create a strong password"
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
                                    {errors.password && (
                                        <p className="text-error text-sm mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                {/* Password Strength Indicator */}
                                {watchedPassword && (
                                    <div className="mt-2">
                                        <PasswordStrengthIndicator
                                            password={watchedPassword}
                                            variant="detailed"
                                            showSuggestions={false}
                                            showScore={true}
                                        />
                                    </div>
                                )}

                                {/* Confirm Password Field */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            {...register('confirmPassword')}
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>


                                {/* Terms and Privacy */}
                                <div className="space-y-4">
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('acceptTerms')}
                                            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-primary-blue focus:ring-primary-blue focus:ring-2"
                                        />
                                        <span className="text-sm text-gray-400">
                                            I accept the{' '}
                                            <Link href="/terms" className="text-primary-blue-light hover:text-primary-blue underline">
                                                Terms and Conditions
                                            </Link>
                                        </span>
                                    </label>
                                    {errors.acceptTerms && (
                                        <p className="text-error text-sm">{errors.acceptTerms.message}</p>
                                    )}

                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('acceptPrivacy')}
                                            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-primary-blue focus:ring-primary-blue focus:ring-2"
                                        />
                                        <span className="text-sm text-gray-400">
                                            I accept the{' '}
                                            <Link href="/privacy" className="text-primary-blue-light hover:text-primary-blue underline">
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </label>
                                    {errors.acceptPrivacy && (
                                        <p className="text-error text-sm">{errors.acceptPrivacy.message}</p>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-primary-blue to-primary-purple text-white font-medium px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary-blue/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Root Error Display */}
                                {errors.root && (
                                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-red-400 text-sm">{errors.root.message}</p>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-300">
                                        Your account has been created successfully!
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Please check your email for verification instructions before signing in.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Link
                                        href="/auth/login"
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-purple text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary-blue/25 transition-all duration-300"
                                    >
                                        Go to Sign In
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Form Footer */}
                        {!registrationSuccess && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="text-center">
                                    <p className="text-gray-400">
                                        Already have an account?{' '}
                                        <Link href="/auth/login" className="text-primary-blue-light hover:text-primary-blue underline">
                                            Sign in here
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
