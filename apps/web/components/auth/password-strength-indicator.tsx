/**
 * Password Strength Indicator Component
 * Shows real-time password strength with visual feedback and suggestions
 */

'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Shield,
    ShieldCheck,
    ShieldX
} from 'lucide-react'

export interface PasswordStrengthIndicatorProps {
    password: string
    className?: string
    showSuggestions?: boolean
    showScore?: boolean
    variant?: 'default' | 'compact' | 'detailed'
}

export interface PasswordStrength {
    score: number
    feedback: string[]
    isStrong: boolean
    color: string
    label: string
    icon: React.ComponentType<{ className?: string }>
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
    password,
    className = '',
    showSuggestions = true,
    showScore = true,
    variant = 'default'
}) => {
    const strength = useMemo(() => {
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

        // Determine color and label
        let color: string
        let label: string
        let icon: React.ComponentType<{ className?: string }>

        if (score === 0) {
            color = 'text-gray-400'
            label = 'Very Weak'
            icon = ShieldX
        } else if (score <= 2) {
            color = 'text-red-400'
            label = 'Weak'
            icon = ShieldX
        } else if (score <= 3) {
            color = 'text-orange-400'
            label = 'Fair'
            icon = AlertCircle
        } else if (score <= 4) {
            color = 'text-yellow-400'
            label = 'Good'
            icon = Shield
        } else if (score <= 5) {
            color = 'text-blue-400'
            label = 'Strong'
            icon = ShieldCheck
        } else {
            color = 'text-green-400'
            label = 'Very Strong'
            icon = ShieldCheck
        }

        return {
            score: Math.min(score, 7),
            feedback,
            isStrong,
            color,
            label,
            icon
        }
    }, [password])

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center space-x-2', className)}>
                <strength.icon className={cn('w-4 h-4', strength.color)} />
                <span className={cn('text-sm font-medium', strength.color)}>
                    {strength.label}
                </span>
                {showScore && (
                    <span className="text-xs text-gray-400">
                        ({strength.score}/7)
                    </span>
                )}
            </div>
        )
    }

    if (variant === 'detailed') {
        return (
            <div className={cn('space-y-3', className)}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <strength.icon className={cn('w-5 h-5', strength.color)} />
                        <span className={cn('text-sm font-medium', strength.color)}>
                            {strength.label}
                        </span>
                    </div>
                    {showScore && (
                        <span className="text-xs text-gray-400">
                            Score: {strength.score}/7
                        </span>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className={cn(
                            'h-full transition-all duration-500 ease-out rounded-full',
                            strength.score <= 2 ? 'bg-red-500' :
                                strength.score <= 3 ? 'bg-orange-500' :
                                    strength.score <= 4 ? 'bg-yellow-500' :
                                        strength.score <= 5 ? 'bg-primary-blue' :
                                            'bg-green-500'
                        )}
                        style={{ width: `${(strength.score / 7) * 100}%` }}
                    />
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                        { label: '8+ characters', met: password.length >= 8 },
                        { label: 'Lowercase', met: /[a-z]/.test(password) },
                        { label: 'Uppercase', met: /[A-Z]/.test(password) },
                        { label: 'Number', met: /\d/.test(password) },
                        { label: 'Special char', met: /[@$!%*?&]/.test(password) },
                        { label: '12+ characters', met: password.length >= 12 }
                    ].map((requirement, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            {requirement.met ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                                <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            <span className={requirement.met ? 'text-green-400' : 'text-red-400'}>
                                {requirement.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Suggestions */}
                {showSuggestions && strength.feedback.length > 0 && (
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <h4 className="text-xs font-medium text-gray-300 mb-2">
                            To improve your password:
                        </h4>
                        <ul className="space-y-1">
                            {strength.feedback.map((suggestion, index) => (
                                <li key={index} className="text-xs text-gray-400 flex items-center space-x-2">
                                    <XCircle className="w-3 h-3 text-red-400" />
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )
    }

    // Default variant
    return (
        <div className={cn('space-y-2', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <strength.icon className={cn('w-4 h-4', strength.color)} />
                    <span className={cn('text-sm font-medium', strength.color)}>
                        {strength.label}
                    </span>
                </div>
                {showScore && (
                    <span className="text-xs text-gray-400">
                        {strength.score}/7
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-500 ease-out rounded-full',
                        strength.score <= 2 ? 'bg-red-500' :
                            strength.score <= 3 ? 'bg-orange-500' :
                                strength.score <= 4 ? 'bg-yellow-500' :
                                    strength.score <= 5 ? 'bg-primary-blue' :
                                        'bg-green-500'
                    )}
                    style={{ width: `${(strength.score / 7) * 100}%` }}
                />
            </div>

            {/* Suggestions */}
            {showSuggestions && strength.feedback.length > 0 && (
                <div className="text-xs text-gray-400">
                    <span className="font-medium">Missing: </span>
                    {strength.feedback.slice(0, 2).join(', ')}
                    {strength.feedback.length > 2 && '...'}
                </div>
            )}
        </div>
    )
}

/**
 * Password Requirements Component
 */
export const PasswordRequirements: React.FC<{
    className?: string
    showIcons?: boolean
}> = ({ className = '', showIcons = true }) => {
    const requirements = [
        { label: 'At least 8 characters', icon: CheckCircle },
        { label: 'One lowercase letter (a-z)', icon: CheckCircle },
        { label: 'One uppercase letter (A-Z)', icon: CheckCircle },
        { label: 'One number (0-9)', icon: CheckCircle },
        { label: 'One special character (@$!%*?&)', icon: CheckCircle }
    ]

    return (
        <div className={cn('space-y-2', className)}>
            <h4 className="text-xs font-medium text-gray-300">
                Password Requirements:
            </h4>
            <ul className="space-y-1">
                {requirements.map((requirement, index) => (
                    <li key={index} className="text-xs text-gray-400 flex items-center space-x-2">
                        {showIcons && (
                            <requirement.icon className="w-3 h-3 text-gray-500" />
                        )}
                        <span>{requirement.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

/**
 * Password Match Indicator
 */
export const PasswordMatchIndicator: React.FC<{
    password: string
    confirmPassword: string
    className?: string
}> = ({ password, confirmPassword, className = '' }) => {
    const isMatch = password === confirmPassword && password.length > 0
    const isEmpty = password.length === 0 || confirmPassword.length === 0

    if (isEmpty) return null

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            {isMatch ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
                <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className={cn(
                'text-sm',
                isMatch ? 'text-green-400' : 'text-red-400'
            )}>
                {isMatch ? 'Passwords match' : 'Passwords do not match'}
            </span>
        </div>
    )
}
