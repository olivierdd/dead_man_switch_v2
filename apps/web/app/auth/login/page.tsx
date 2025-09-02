/**
 * Login Page
 * User authentication page with glassmorphic design
 */

'use client'

import React from 'react'
import { LoginFormSimple } from '@/components/auth'
import { ParticleBackground } from '@/components/three/ParticleBackground'

export default function LoginPage() {
    return (
        <div className="relative min-h-screen">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    {/* Login Form */}
                    <LoginFormSimple
                        variant="elevated"
                        size="lg"
                        showRegistrationLink={true}
                        showForgotPasswordLink={true}
                        redirectTo="/dashboard"
                        onSuccess={() => console.log('Login successful')}
                        onError={(error) => console.error('Login error:', error)}
                    />
                </div>
            </div>
        </div>
    )
}
