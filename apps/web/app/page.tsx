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
                            Privacy-first digital dead man's switch service that ensures your critical messages
                            reach their intended recipients, even if you can't deliver them yourself.
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
                    </div>
                </main>

                {/* Features Preview */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold text-white text-center mb-16">
                            Built for Every Need
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Role-based Access */}
                            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
                                <div className="text-4xl mb-4">👥</div>
                                <h3 className="text-2xl font-semibold text-white mb-4">Role-Based Access</h3>
                                <p className="text-gray-400 mb-6">
                                    Different access levels for Admins, Writers, and Readers.
                                    Control who can see what, when.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Admin</span>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Writer</span>
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Reader</span>
                                </div>
                            </div>

                            {/* Message Management */}
                            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
                                <div className="text-4xl mb-4">💬</div>
                                <h3 className="text-2xl font-semibold text-white mb-4">Smart Messages</h3>
                                <p className="text-gray-400 mb-6">
                                    Create encrypted messages with custom check-in schedules,
                                    grace periods, and dissolution plans.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Encrypted</span>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Scheduled</span>
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Automated</span>
                                </div>
                            </div>

                            {/* Security Features */}
                            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
                                <div className="text-4xl mb-4">🛡️</div>
                                <h3 className="text-2xl font-semibold text-white mb-4">Enterprise Security</h3>
                                <p className="text-gray-400 mb-6">
                                    Military-grade encryption, audit logs, and compliance features
                                    for business and personal use.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">AES-256</span>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Audit Logs</span>
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Compliance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

