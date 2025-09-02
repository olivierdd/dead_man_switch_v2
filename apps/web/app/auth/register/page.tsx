/**
 * Registration Page
 * User registration page with glassmorphic design
 */

'use client'

import React, { useState } from 'react'
import { ParticleBackground } from '@/components/three/ParticleBackground'
import { PasswordStrengthIndicator } from '@/components/auth'
import { useFormValidation, useFormSubmission } from '@/lib/hooks/use-form-validation'
import { z } from 'zod'
import Link from 'next/link'
import { Mail, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

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
    // Password visibility states
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
                    {/* Registration Form */}
                    <div className="glass-card p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Create Your Account
                            </h1>
                            <p className="text-gray-400">
                                Enter your details to create your account
                            </p>
                        </div>
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

                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-white font-medium mb-2">
                                    Username *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register('username')}
                                        type="text"
                                        id="username"
                                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                        placeholder="Choose a username"
                                    />
                                </div>
                                {errors.username && (
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
                                        showSuggestions={true}
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

                            {/* Password Requirements Link */}
                            <div className="mt-2">
                                <Link
                                    href="/help#password-requirements"
                                    className="text-xs text-primary-blue-light hover:text-primary-blue underline"
                                >
                                    View password requirements
                                </Link>
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
                        </form>

                        {/* Form Footer */}
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
                    </div>
                </div>
            </div>
        </div>
    )
}
