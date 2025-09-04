/**
 * Dashboard Page
 * Main user dashboard after successful login
 */

'use client'

import React from 'react'
import { useAuth } from '@/lib/auth/auth-hooks'
import { ParticleBackground } from '@/components/three/ParticleBackground'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, Shield } from 'lucide-react'

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="relative min-h-screen">
                <ParticleBackground />
                <div className="relative z-10 flex items-center justify-center min-h-screen">
                    <div className="text-white text-xl">Loading...</div>
                </div>
            </div>
        )
    }

    if (!user) {
        router.push('/auth/login')
        return null
    }

    return (
        <div className="relative min-h-screen">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Main Content */}
            <div className="relative z-10 min-h-screen p-4">
                {/* Header */}
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Welcome back, {user.display_name}!
                            </h1>
                            <p className="text-gray-300 mt-2">
                                Manage your secret messages and account settings
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Dashboard Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* User Info Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Account Info</h3>
                                    <p className="text-sm text-gray-400">Your profile details</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Email:</span>
                                    <span className="text-white">{user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Role:</span>
                                    <span className="text-white capitalize">{user.role}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Verified:</span>
                                    <span className={user.is_verified ? 'text-green-400' : 'text-yellow-400'}>
                                        {user.is_verified ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Secret Messages</h3>
                                    <p className="text-sm text-gray-400">Manage your messages</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-gray-400 text-sm">
                                    This feature is coming soon. You'll be able to create and manage your secret messages here.
                                </div>
                            </div>
                        </div>

                        {/* Settings Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <Settings className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Settings</h3>
                                    <p className="text-sm text-gray-400">Account preferences</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-gray-400 text-sm">
                                    Account settings and preferences will be available here.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coming Soon Section */}
                    <div className="mt-12 text-center">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                More Features Coming Soon
                            </h2>
                            <p className="text-gray-300 mb-6">
                                We're working hard to bring you the complete Secret Safe experience.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                                <div>🔐 Create Secret Messages</div>
                                <div>📧 Email Notifications</div>
                                <div>🔑 Advanced Security</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
