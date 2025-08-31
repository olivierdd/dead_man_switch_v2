import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ParticleBackground } from '@/components/three/ParticleBackground'

export default function HomePage() {
    return (
        <div className="relative min-h-screen">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Main Content */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <div className="text-2xl font-bold text-white">
                                    🔐 Secret Safe
                                </div>
                            </div>
                            <div className="hidden md:flex items-center space-x-8">
                                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                                    How It Works
                                </Link>
                                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                                    Pricing
                                </Link>
                                <Link href="/security" className="text-gray-300 hover:text-white transition-colors">
                                    Security
                                </Link>
                                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                                    About
                                </Link>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link href="/auth/login">
                                    <Button variant="ghost" className="text-white hover:bg-white/10">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="btn-gradient">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="pt-32 pb-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
                            Your Secret Is Safe
                            <span className="block text-gradient">With Us</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                            Secure messages that reach your loved ones even when you can't. Zero-knowledge encryption ensures only intended recipients can read your words.
                        </p>

                        {/* Call to Action */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            <Link href="/auth/register">
                                <Button size="lg" className="btn-gradient text-lg px-8 py-4">
                                    Start Securing Your Secrets
                                </Button>
                            </Link>
                            <Link href="/how-it-works">
                                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 text-lg px-8 py-4">
                                    Learn How It Works
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
                            <div className="glass-card p-6">
                                <div className="text-3xl mb-4">🔒</div>
                                <h3 className="text-xl font-semibold text-white mb-2">Zero-Knowledge Security</h3>
                                <p className="text-gray-400">
                                    We can't read your messages. Only you and your recipients have access.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="text-3xl mb-4">⚡</div>
                                <h3 className="text-xl font-semibold text-white mb-2">Automatic Delivery</h3>
                                <p className="text-gray-400">
                                    Set check-in schedules and let our system handle the rest automatically.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="text-3xl mb-4">🌐</div>
                                <h3 className="text-xl font-semibold text-white mb-2">Blockchain Backup</h3>
                                <p className="text-gray-400">
                                    Ultimate tier messages survive even if our company disappears.
                                </p>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="glass-card p-6">
                                <div className="text-3xl mb-4">👥</div>
                                <h3 className="text-xl font-semibold text-white mb-2">Role-Based Access</h3>
                                <p className="text-gray-400">
                                    Different access levels for Admins, Writers, and Readers.
                                    Control who can see what, when.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="text-3xl mb-4">💬</div>
                                <h3 className="text-xl font-semibold text-white mb-2">Smart Messages</h3>
                                <p className="text-gray-400">
                                    Create encrypted messages with custom check-in schedules,
                                    grace periods, and dissolution plans.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="text-3xl mb-4">🛡️</div>
                                <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
                                <p className="text-gray-400">
                                    Military-grade encryption, audit logs, and compliance features
                                    for business and personal use.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gradient-to-t from-black via-gray-900 to-gray-800 border-t border-blue-500/20 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Main Footer Content */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {/* Brand Section */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-3">
                                    <div className="text-xl mr-2">🔐</div>
                                    <div className="text-xl font-bold text-blue-400">Secret Safe</div>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                                    Protecting your digital legacy with zero-knowledge encryption and blockchain durability.
                                </p>
                            </div>

                            {/* Product Links */}
                            <div>
                                <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Product</h4>
                                <ul className="space-y-1">
                                    <li><a href="/features" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Features</a></li>
                                    <li><a href="/pricing" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Pricing</a></li>
                                    <li><a href="/auth/register" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Get Started</a></li>
                                    <li><a href="/dashboard" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Dashboard</a></li>
                                </ul>
                            </div>

                            {/* Support Links */}
                            <div>
                                <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Support</h4>
                                <ul className="space-y-1">
                                    <li><a href="/help" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Help Center</a></li>
                                    <li><a href="/contact" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Contact Us</a></li>
                                    <li><a href="/status" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Service Status</a></li>
                                    <li><a href="/api-docs" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">API Documentation</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Legal Links */}
                        <div className="border-t border-gray-700 pt-6 mb-6">
                            <div className="flex flex-wrap gap-4 justify-center">
                                <a href="/privacy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Privacy Policy</a>
                                <a href="/terms" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Terms of Service</a>
                                <a href="/cookies" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Cookie Policy</a>
                                <a href="/security" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Security</a>
                                <a href="/gdpr" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">GDPR Compliance</a>
                            </div>
                        </div>

                        {/* Copyright and Description */}
                        <div className="border-t border-gray-700 pt-6 text-center">
                            <div className="text-gray-400 text-sm mb-3">
                                © 2025 Secret Safe. All rights reserved.
                            </div>
                            <div className="text-gray-500 text-xs leading-relaxed max-w-3xl mx-auto">
                                Secret Safe is a digital legacy protection service. We use zero-knowledge encryption to ensure your messages remain private. While we strive for 100% reliability, we cannot guarantee message delivery in all circumstances. Users are responsible for maintaining their check-in schedule and ensuring their recipients can access the service.
                            </div>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    )
}

