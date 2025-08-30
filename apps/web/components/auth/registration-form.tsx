'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { useAuthActionsHook, useAuthActions } from '@/lib/auth'
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle, AlertCircle } from 'lucide-react'

// Registration form validation schema
const registrationSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .max(255, 'Email is too long'),

    password: z
        .string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character')
        .refine((password) => {
            // Check for weak patterns
            const weakPatterns = [
                '123', 'abc', 'qwe', 'password', 'admin', 'user',
                '123456', 'password123', 'admin123', 'qwerty'
            ]
            const passwordLower = password.toLowerCase()
            return !weakPatterns.some(pattern => passwordLower.includes(pattern))
        }, 'Password contains common weak patterns'),

    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),

    displayName: z
        .string()
        .min(2, 'Display name must be at least 2 characters')
        .max(50, 'Display name is too long')
        .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Display name can only contain letters, numbers, spaces, hyphens, and underscores'),

    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name is too long')
        .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name is too long')
        .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

    role: z
        .enum(['writer', 'reader'], {
            errorMap: () => ({ message: 'Please select a valid role' })
        }),

    acceptTerms: z
        .boolean()
        .refine((val) => val === true, 'You must accept the terms and conditions'),

    acceptPrivacy: z
        .boolean()
        .refine((val) => val === true, 'You must accept the privacy policy'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type RegistrationFormData = z.infer<typeof registrationSchema>

interface RegistrationFormProps {
    onSuccess?: () => void
    onError?: (error: string) => void
    className?: string
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
    onSuccess,
    onError,
    className = '',
}) => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register: registerUser } = useAuthActionsHook()
    const { setError } = useAuthActions()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        watch,
        setValue,
        trigger,
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        mode: 'onChange',
        defaultValues: {
            role: 'writer',
            acceptTerms: false,
            acceptPrivacy: false,
        },
    })

    const watchedPassword = watch('password')
    const watchedEmail = watch('email')

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (!password) return { score: 0, label: '', color: '' }

        let score = 0
        if (password.length >= 12) score++
        if (/[A-Z]/.test(password)) score++
        if (/[a-z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) score++

        const weakPatterns = ['123', 'abc', 'qwe', 'password', 'admin', 'user', '123456', 'password123', 'admin123', 'qwerty']
        const hasWeakPattern = weakPatterns.some(pattern => password.toLowerCase().includes(pattern))
        if (!hasWeakPattern) score++

        if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' }
        if (score <= 4) return { score, label: 'Fair', color: 'text-yellow-500' }
        if (score <= 6) return { score, label: 'Good', color: 'text-blue-500' }
        return { score, label: 'Strong', color: 'text-green-500' }
    }

    const passwordStrength = getPasswordStrength(watchedPassword)

    const onSubmit = async (data: RegistrationFormData) => {
        try {
            setIsSubmitting(true)

            const response = await registerUser({
                email: data.email,
                password: data.password,
                first_name: data.firstName,
                last_name: data.lastName,
                display_name: data.displayName,
                role: data.role,
            })

            // Clear any previous errors
            setError(null)

            // Show success message
            if (onSuccess) {
                onSuccess()
            }

            // You could also redirect to email verification page here

        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'

            if (onError) {
                onError(errorMessage)
            } else {
                setError(errorMessage)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={`w-full max-w-md mx-auto ${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            {...register('email')}
                            type="email"
                            id="email"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your email"
                        />
                    </div>
                    {errors.email && (
                        <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.email.message}</span>
                        </div>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-white">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className="w-full pl-10 pr-12 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Create a strong password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Password strength:</span>
                                <span className={passwordStrength.color}>{passwordStrength.label}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.score <= 2 ? 'bg-red-500' :
                                            passwordStrength.score <= 4 ? 'bg-yellow-500' :
                                                passwordStrength.score <= 6 ? 'bg-blue-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {errors.password && (
                        <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.password.message}</span>
                        </div>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            {...register('confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            className="w-full pl-10 pr-12 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.confirmPassword.message}</span>
                        </div>
                    )}
                </div>

                {/* Display Name Field */}
                <div className="space-y-2">
                    <label htmlFor="displayName" className="block text-sm font-medium text-white">
                        Display Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            {...register('displayName')}
                            type="text"
                            id="displayName"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Choose a display name"
                        />
                    </div>
                    {errors.displayName && (
                        <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.displayName.message}</span>
                        </div>
                    )}
                </div>

                {/* First and Last Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-white">
                            First Name
                        </label>
                        <input
                            {...register('firstName')}
                            type="text"
                            id="firstName"
                            className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="First name"
                        />
                        {errors.firstName && (
                            <div className="flex items-center space-x-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.firstName.message}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-white">
                            Last Name
                        </label>
                        <input
                            {...register('lastName')}
                            type="text"
                            id="lastName"
                            className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Last name"
                        />
                        {errors.lastName && (
                            <div className="flex items-center space-x-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.lastName.message}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-medium text-white">
                        Account Type
                    </label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            {...register('role')}
                            id="role"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                        >
                            <option value="writer" className="bg-gray-800 text-white">Writer - Create and manage messages</option>
                            <option value="reader" className="bg-gray-800 text-white">Reader - Access shared messages only</option>
                        </select>
                    </div>
                    {errors.role && (
                        <div className="flex items-center space-x-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.role.message}</span>
                        </div>
                    )}
                </div>

                {/* Terms and Privacy Checkboxes */}
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <input
                            {...register('acceptTerms')}
                            type="checkbox"
                            id="acceptTerms"
                            className="mt-1 w-4 h-4 text-blue-600 bg-white/5 border-white/10 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                            I accept the{' '}
                            <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                                Terms and Conditions
                            </a>
                        </label>
                    </div>
                    {errors.acceptTerms && (
                        <div className="flex items-center space-x-2 text-red-400 text-sm ml-7">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.acceptTerms.message}</span>
                        </div>
                    )}

                    <div className="flex items-start space-x-3">
                        <input
                            {...register('acceptPrivacy')}
                            type="checkbox"
                            id="acceptPrivacy"
                            className="mt-1 w-4 h-4 text-blue-600 bg-white/5 border-white/10 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="acceptPrivacy" className="text-sm text-gray-300">
                            I accept the{' '}
                            <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                                Privacy Policy
                            </a>
                        </label>
                    </div>
                    {errors.acceptPrivacy && (
                        <div className="flex items-center space-x-2 text-red-400 text-sm ml-7">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.acceptPrivacy.message}</span>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full py-3 text-lg font-semibold"
                    disabled={!isValid || !isDirty || isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating Account...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>Create Account</span>
                        </div>
                    )}
                </Button>

                {/* Form Status */}
                {!isValid && isDirty && (
                    <div className="text-center text-sm text-yellow-400">
                        Please fix the errors above to continue
                    </div>
                )}
            </form>
        </div>
    )
}
