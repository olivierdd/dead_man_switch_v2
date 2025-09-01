import React from 'react'
import { ForevrLogo } from '@/components/ui/forevr-logo'

export default function LogoDemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark to-secondary-dark p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">Forevr Logo Demo</h1>

                <div className="space-y-12">
                    {/* Full Logo */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Full Logo</h2>
                        <div className="flex justify-center">
                            <ForevrLogo variant="full" />
                        </div>
                        <p className="text-gray-300 text-center mt-4">Perfect for hero sections and large displays</p>
                    </div>

                    {/* Compact Logo */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Compact Logo (Header)</h2>
                        <div className="flex justify-center">
                            <ForevrLogo variant="compact" />
                        </div>
                        <p className="text-gray-300 text-center mt-4">Optimized for navigation headers</p>
                    </div>

                    {/* Icon Only */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Icon Only</h2>
                        <div className="flex justify-center space-x-8">
                            <ForevrLogo variant="icon" />
                            <ForevrLogo variant="icon" width={48} height={48} />
                            <ForevrLogo variant="icon" width={64} height={64} />
                        </div>
                        <p className="text-gray-300 text-center mt-4">Perfect for favicons, buttons, and small spaces</p>
                    </div>

                    {/* Color Scheme */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Brand Colors Used</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mx-auto mb-2"></div>
                                <p className="text-white text-sm">Primary Gradient</p>
                                <p className="text-gray-400 text-xs">Blue to Purple</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg mx-auto mb-2"></div>
                                <p className="text-white text-sm">Accent Gradient</p>
                                <p className="text-gray-400 text-xs">Cyan to Blue</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-2"></div>
                                <p className="text-white text-sm">Blue</p>
                                <p className="text-gray-400 text-xs">#3B82F6</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-500 rounded-lg mx-auto mb-2"></div>
                                <p className="text-white text-sm">Purple</p>
                                <p className="text-gray-400 text-xs">#8B5CF6</p>
                            </div>
                        </div>
                    </div>

                    {/* Usage Examples */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Usage Examples</h2>
                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-white mb-2">In Header</h3>
                                <code className="text-blue-400 text-sm">
                                    {`<ForevrLogo variant="compact" className="h-8 w-auto" />`}
                                </code>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-white mb-2">As Favicon</h3>
                                <code className="text-blue-400 text-sm">
                                    {`<ForevrLogo variant="icon" width={32} height={32} />`}
                                </code>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-white mb-2">Hero Section</h3>
                                <code className="text-blue-400 text-sm">
                                    {`<ForevrLogo variant="full" className="w-64 h-auto" />`}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

