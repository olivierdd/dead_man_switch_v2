import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            {/* Navigation */}
            <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-2xl font-bold text-white">
                                🔐 Secret Safe
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/how-it-works" className="text-blue-400 font-medium">
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

            {/* Main Content */}
            <main className="pt-16 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            How Secret Safe
                            <span className="block text-gradient">Works</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            A simple, secure way to ensure your important messages reach the right people,
                            even when you can't deliver them yourself.
                        </p>
                    </div>

                    {/* Step-by-Step Process */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="glass-card p-8 text-center">
                            <div className="text-4xl mb-4">✍️</div>
                            <h3 className="text-2xl font-semibold text-white mb-4">1. Create Your Message</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Write your message using our secure editor. Add recipients, set check-in schedules,
                                and configure delivery preferences. Your content is encrypted before it leaves your device.
                            </p>
                        </div>

                        <div className="glass-card p-8 text-center">
                            <div className="text-4xl mb-4">⏰</div>
                            <h3 className="text-2xl font-semibold text-white mb-4">2. Set Up Check-ins</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Choose how often you want to check in - daily, weekly, or monthly.
                                We'll send you gentle reminders to confirm you're still active and in control.
                            </p>
                        </div>

                        <div className="glass-card p-8 text-center">
                            <div className="text-4xl mb-4">🚀</div>
                            <h3 className="text-2xl font-semibold text-white mb-4">3. Automatic Delivery</h3>
                            <p className="text-gray-400 leading-relaxed">
                                If you miss your check-ins, your message is automatically delivered to recipients.
                                They can access it securely without needing an account.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Process */}
                    <div className="space-y-12 mb-16">
                        <div className="glass-card p-8">
                            <h2 className="text-3xl font-bold text-white mb-6">The Complete Process</h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Message Creation</h3>
                                        <p className="text-gray-400">
                                            Compose your message with our rich text editor. Add multiple recipients,
                                            set custom check-in intervals, and configure grace periods. All content
                                            is encrypted client-side before transmission.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Recipient Management</h3>
                                        <p className="text-gray-400">
                                            Add recipients by email address. Each recipient gets a unique,
                                            secure access link. You can add or remove recipients at any time
                                            before the message is delivered.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Check-in Schedule</h3>
                                        <p className="text-gray-400">
                                            Set your preferred check-in frequency. We'll send email reminders
                                            and you can check in with one click. Missing check-ins triggers
                                            the grace period countdown.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Grace Period</h3>
                                        <p className="text-gray-400">
                                            If you miss check-ins, a grace period begins. During this time,
                                            you can still check in to prevent delivery. The grace period
                                            is customizable from 1-30 days.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Message Delivery</h3>
                                        <p className="text-gray-400">
                                            After the grace period expires, your message is automatically
                                            delivered to all recipients. They receive secure access links
                                            and can view the content without creating accounts.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Use Cases */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Common Use Cases</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 rounded-lg">
                                <h3 className="text-xl font-semibold text-white mb-3">💼 Business Continuity</h3>
                                <p className="text-gray-400">
                                    Share critical business information, passwords, and procedures with partners
                                    or successors. Ensure business operations continue even in unexpected circumstances.
                                </p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-lg">
                                <h3 className="text-xl font-semibold text-white mb-3">👨‍👩‍👧‍👦 Family Legacy</h3>
                                <p className="text-gray-400">
                                    Leave personal messages, family history, or important documents for loved ones.
                                    Share your thoughts and wishes in a secure, organized way.
                                </p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-lg">
                                <h3 className="text-xl font-semibold text-white mb-3">🔑 Digital Assets</h3>
                                <p className="text-gray-400">
                                    Safely share access to cryptocurrency wallets, password managers,
                                    and digital accounts with trusted family members or advisors.
                                </p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-lg">
                                <h3 className="text-xl font-semibold text-white mb-3">📋 Legal Documents</h3>
                                <p className="text-gray-400">
                                    Store important legal information, medical directives, or final wishes.
                                    Ensure your intentions are clearly communicated when needed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security Features */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">Security & Privacy</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl mb-3">🔐</div>
                                <h3 className="text-lg font-semibold text-white mb-2">Zero-Knowledge</h3>
                                <p className="text-gray-400 text-sm">
                                    We cannot read your messages. All content is encrypted before it reaches our servers.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl mb-3">🛡️</div>
                                <h3 className="text-lg font-semibold text-white mb-2">Military-Grade Encryption</h3>
                                <p className="text-gray-400 text-sm">
                                    AES-256 encryption ensures your messages are protected with the highest security standards.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl mb-3">🌐</div>
                                <h3 className="text-lg font-semibold text-white mb-2">Blockchain Backup</h3>
                                <p className="text-gray-400 text-sm">
                                    Ultimate tier messages are backed up on decentralized networks for maximum durability.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Create your first secure message in minutes. No technical knowledge required.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/register">
                                <Button size="lg" className="btn-gradient text-lg px-8 py-4">
                                    Start Securing Your Secrets
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 text-lg px-8 py-4">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
