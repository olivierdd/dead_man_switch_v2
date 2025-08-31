/**
 * Authentication Validation Schemas
 * Comprehensive validation rules using Zod for all auth-related forms
 */

import { z } from 'zod'

// Common validation patterns
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Password strength requirements
const passwordRequirements = {
    minLength: 8,
    maxLength: 128,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true
}

/**
 * Login Form Schema
 */
export const loginSchema = z.object({
    username: z
        .string()
        .min(1, 'Username or email is required')
        .max(255, 'Username or email is too long'),

    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),

    rememberMe: z
        .boolean()
        .optional(),

    captchaToken: z
        .string()
        .optional()
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Registration Form Schema
 */
export const registrationSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .max(255, 'Email is too long')
        .refine(
            (email) => emailPattern.test(email),
            'Please enter a valid email address'
        ),

    username: z
        .string()
        .min(1, 'Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be 20 characters or less')
        .refine(
            (username) => usernamePattern.test(username),
            'Username can only contain letters, numbers, underscores, and hyphens'
        )
        .refine(
            (username) => !username.startsWith('-') && !username.endsWith('-'),
            'Username cannot start or end with a hyphen'
        ),

    displayName: z
        .string()
        .min(1, 'Display name is required')
        .min(2, 'Display name must be at least 2 characters')
        .max(50, 'Display name must be 50 characters or less')
        .refine(
            (name) => /^[a-zA-Z0-9\s\-_\.]+$/.test(name),
            'Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods'
        ),

    password: z
        .string()
        .min(1, 'Password is required')
        .min(passwordRequirements.minLength, `Password must be at least ${passwordRequirements.minLength} characters`)
        .max(passwordRequirements.maxLength, `Password must be ${passwordRequirements.maxLength} characters or less`)
        .refine(
            (password) => passwordRequirements.requireLowercase ? /[a-z]/.test(password) : true,
            'Password must contain at least one lowercase letter'
        )
        .refine(
            (password) => passwordRequirements.requireUppercase ? /[A-Z]/.test(password) : true,
            'Password must contain at least one uppercase letter'
        )
        .refine(
            (password) => passwordRequirements.requireNumbers ? /\d/.test(password) : true,
            'Password must contain at least one number'
        )
        .refine(
            (password) => passwordRequirements.requireSpecialChars ? /[@$!%*?&]/.test(password) : true,
            'Password must contain at least one special character (@$!%*?&)'
        ),

    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),

    acceptTerms: z
        .boolean()
        .refine((val) => val === true, 'You must accept the terms and conditions'),

    acceptPrivacy: z
        .boolean()
        .refine((val) => val === true, 'You must accept the privacy policy'),

    marketingEmails: z
        .boolean()
        .optional(),

    captchaToken: z
        .string()
        .optional()
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    }
)

export type RegistrationFormData = z.infer<typeof registrationSchema>

/**
 * Password Reset Request Schema
 */
export const passwordResetRequestSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .max(255, 'Email is too long'),

    captchaToken: z
        .string()
        .optional()
})

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>

/**
 * Password Reset Schema
 */
export const passwordResetSchema = z.object({
    token: z
        .string()
        .min(1, 'Reset token is required'),

    password: z
        .string()
        .min(1, 'New password is required')
        .min(passwordRequirements.minLength, `Password must be at least ${passwordRequirements.minLength} characters`)
        .max(passwordRequirements.maxLength, `Password must be ${passwordRequirements.maxLength} characters or less`)
        .refine(
            (password) => passwordRequirements.requireLowercase ? /[a-z]/.test(password) : true,
            'Password must contain at least one lowercase letter'
        )
        .refine(
            (password) => passwordRequirements.requireUppercase ? /[A-Z]/.test(password) : true,
            'Password must contain at least one uppercase letter'
        )
        .refine(
            (password) => passwordRequirements.requireNumbers ? /\d/.test(password) : true,
            'Password must contain at least one number'
        )
        .refine(
            (password) => passwordRequirements.requireSpecialChars ? /[@$!%*?&]/.test(password) : true,
            'Password must contain at least one special character (@$!%*?&)'
        ),

    confirmPassword: z
        .string()
        .min(1, 'Please confirm your new password')
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    }
)

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>

/**
 * Email Verification Schema
 */
export const emailVerificationSchema = z.object({
    token: z
        .string()
        .min(1, 'Verification token is required'),

    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
})

export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>

/**
 * Profile Update Schema
 */
export const profileUpdateSchema = z.object({
    displayName: z
        .string()
        .min(1, 'Display name is required')
        .min(2, 'Display name must be at least 2 characters')
        .max(50, 'Display name must be 50 characters or less')
        .refine(
            (name) => /^[a-zA-Z0-9\s\-_\.]+$/.test(name),
            'Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods'
        ),

    bio: z
        .string()
        .max(500, 'Bio must be 500 characters or less')
        .optional(),

    avatarUrl: z
        .string()
        .url('Please enter a valid URL')
        .optional(),

    timezone: z
        .string()
        .optional(),

    language: z
        .string()
        .optional()
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

/**
 * Password Change Schema
 */
export const passwordChangeSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'Current password is required'),

    newPassword: z
        .string()
        .min(1, 'New password is required')
        .min(passwordRequirements.minLength, `Password must be at least ${passwordRequirements.minLength} characters`)
        .max(passwordRequirements.maxLength, `Password must be ${passwordRequirements.maxLength} characters or less`)
        .refine(
            (password) => passwordRequirements.requireLowercase ? /[a-z]/.test(password) : true,
            'Password must contain at least one lowercase letter'
        )
        .refine(
            (password) => passwordRequirements.requireUppercase ? /[A-Z]/.test(password) : true,
            'Password must contain at least one uppercase letter'
        )
        .refine(
            (password) => passwordRequirements.requireNumbers ? /\d/.test(password) : true,
            'Password must contain at least one number'
        )
        .refine(
            (password) => passwordRequirements.requireSpecialChars ? /[@$!%*?&]/.test(password) : true,
            'Password must contain at least one special character (@$!%*?&)'
        ),

    confirmNewPassword: z
        .string()
        .min(1, 'Please confirm your new password')
}).refine(
    (data) => data.newPassword === data.confirmNewPassword,
    {
        message: 'Passwords do not match',
        path: ['confirmNewPassword']
    }
).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
        message: 'New password must be different from current password',
        path: ['newPassword']
    }
)

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

/**
 * Two-Factor Authentication Schema
 */
export const twoFactorAuthSchema = z.object({
    code: z
        .string()
        .min(1, 'Authentication code is required')
        .length(6, 'Authentication code must be 6 digits')
        .refine(
            (code) => /^\d{6}$/.test(code),
            'Authentication code must contain only numbers'
        ),

    rememberDevice: z
        .boolean()
        .optional()
})

export type TwoFactorAuthFormData = z.infer<typeof twoFactorAuthSchema>

/**
 * Password Strength Checker
 */
export const checkPasswordStrength = (password: string): {
    score: number
    feedback: string[]
    isStrong: boolean
} => {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length >= 8) {
        score += 1
    } else {
        feedback.push('At least 8 characters')
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
        score += 1
    } else {
        feedback.push('One lowercase letter')
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
        score += 1
    } else {
        feedback.push('One uppercase letter')
    }

    // Number check
    if (/\d/.test(password)) {
        score += 1
    } else {
        feedback.push('One number')
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
        score += 1
    } else {
        feedback.push('One special character (@$!%*?&)')
    }

    // Additional length bonus
    if (password.length >= 12) {
        score += 1
    }

    // Complexity bonus
    if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&]/.test(password)) {
        score += 1
    }

    const isStrong = score >= 5

    return {
        score: Math.min(score, 7),
        feedback,
        isStrong
    }
}

/**
 * Username Availability Checker
 */
export const checkUsernameAvailability = async (username: string): Promise<{
    available: boolean
    suggestions?: string[]
}> => {
    // This would typically make an API call to check username availability
    // For now, we'll simulate the check

    const reservedUsernames = [
        'admin', 'administrator', 'root', 'system', 'support', 'help',
        'info', 'contact', 'mail', 'webmaster', 'noreply', 'test',
        'demo', 'example', 'sample', 'guest', 'anonymous', 'user'
    ]

    const isReserved = reservedUsernames.includes(username.toLowerCase())

    if (isReserved) {
        return {
            available: false,
            suggestions: [
                `${username}123`,
                `${username}_user`,
                `my_${username}`,
                `${username}2024`
            ]
        }
    }

    return { available: true }
}

/**
 * Export all schemas
 */
export const authSchemas = {
    login: loginSchema,
    registration: registrationSchema,
    passwordResetRequest: passwordResetRequestSchema,
    passwordReset: passwordResetSchema,
    emailVerification: emailVerificationSchema,
    profileUpdate: profileUpdateSchema,
    passwordChange: passwordChangeSchema,
    twoFactorAuth: twoFactorAuthSchema
}

export default authSchemas
