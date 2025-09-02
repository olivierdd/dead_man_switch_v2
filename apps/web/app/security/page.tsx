import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Eye, Globe, Server, Key, Mail } from 'lucide-react'

export default function SecurityPage() {
    const securityFeatures = [
        {
            icon: Lock,
            title: "Zero-Knowledge Architecture",
            description: "We cannot read, access, or decrypt your messages. Only you and your intended recipients have access to the content.",
            details: [
                "Client-side encryption before transmission",
                "No server-side decryption capability",
                "End-to-end encryption for all communications",
                "Private keys never leave your device"
            ]
        },
        {
            icon: Shield,
            title: "Military-Grade Encryption",
            description: "Your messages are protected with AES-256 encryption, the same standard used by governments and financial institutions.",
            details: [
                "AES-256-GCM encryption algorithm",
                "256-bit encryption keys",
                "Authenticated encryption with associated data",
                "Regular security audits and updates"
            ]
        },
        {
            icon: Eye,
            title: "Privacy by Design",
            description: "Privacy is built into every aspect of our platform, from data collection to storage and transmission.",
            details: [
                "Minimal data collection policy",
                "No tracking or analytics on message content",
                "Anonymous message access for recipients",
                "GDPR and CCPA compliance"
            ]
        },
        {
            icon: Globe,
            title: "Blockchain Backup Security",
            description: "Ultimate tier messages are secured with decentralized blockchain technology for maximum durability and security.",
            details: [
                "IPFS distributed storage network",
                "Arweave permanent storage",
                "Smart contract verification",
                "Decentralized monitoring systems"
            ]
        },
        {
            icon: Server,
            title: "Infrastructure Security",
            description: "Our hosting infrastructure is built on enterprise-grade security with multiple layers of protection.",
            details: [
                "Vercel Edge Network with DDoS protection",
                "Supabase enterprise security features",
                "Regular penetration testing",
                "SOC 2 Type II compliance"
            ]
        },
        {
            icon: Key,
            title: "Access Control & Authentication",
            description: "Multi-factor authentication and role-based access control ensure only authorized users can access the platform.",
            details: [
                "Two-factor authentication (2FA)",
                "Role-based permissions (Admin/Writer/Reader)",
                "Session management and timeout",
                "Audit logging for all actions"
            ]
        }
    ];

    const complianceFeatures = [
        {
            title: "GDPR Compliance",
            description: "Full compliance with European data protection regulations",
            features: ["Right to be forgotten", "Data portability", "Consent management", "Data breach notification"]
        },
        {
            title: "CCPA Compliance",
            description: "California Consumer Privacy Act compliance for US users",
            features: ["Right to know", "Right to delete", "Right to opt-out", "Non-discrimination"]
        },
        {
            title: "SOC 2 Type II",
            description: "Service Organization Control 2 certification for security",
            features: ["Security controls", "Availability monitoring", "Processing integrity", "Confidentiality"]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-gray-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2">
                                <Mail className="h-8 w-8" style={{ color: '#60a5fa' }} />
                                <span className="text-2xl font-black text-white font-archivo-black">
                                    For<span style={{ color: '#60a5fa' }}>e</span>vr
                                </span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
                                How It Works
                            </Link>
                            <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                                Pricing
                            </Link>
                            <Link href="/security" className="text-primary-blue-light font-medium">
                                Security
                            </Link>
                            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
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
            <main className="pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Security & Privacy
                            <span className="block text-gradient">First</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Your privacy and security are our top priorities. We've built Forevr with
                            enterprise-grade security measures and zero-knowledge architecture to protect your most sensitive information.
                        </p>
                    </div>

                    {/* Security Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {securityFeatures.map((feature, index) => (
                            <div key={index} className="glass-card p-8">
                                <div className="flex items-start space-x-4 mb-6">
                                    <div className="flex-shrink-0">
                                        <feature.icon className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                        <p className="text-gray-400 mb-4">{feature.description}</p>
                                        <ul className="space-y-2">
                                            {feature.details.map((detail, detailIndex) => (
                                                <li key={detailIndex} className="flex items-start space-x-2">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-gray-300 text-sm">{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Encryption Deep Dive */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">How Our Encryption Works</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Client-Side Encryption Process</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                                        <div>
                                            <h4 className="text-white font-medium">Key Generation</h4>
                                            <p className="text-gray-400 text-sm">A unique encryption key is generated in your browser for each message.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                                        <div>
                                            <h4 className="text-white font-medium">Content Encryption</h4>
                                            <p className="text-gray-400 text-sm">Your message is encrypted using AES-256-GCM before leaving your device.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                                        <div>
                                            <h4 className="text-white font-medium">Secure Transmission</h4>
                                            <p className="text-gray-400 text-sm">Only encrypted data is transmitted to our servers over HTTPS/TLS.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                                        <div>
                                            <h4 className="text-white font-medium">Storage & Delivery</h4>
                                            <p className="text-gray-400 text-sm">Encrypted content is stored and delivered to recipients with access keys.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Security Benefits</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <h4 className="text-white font-medium mb-2">🔒 No Server Access</h4>
                                        <p className="text-gray-400 text-sm">Our servers cannot decrypt your messages, even under legal pressure.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <h4 className="text-white font-medium mb-2">🛡️ Quantum Resistance</h4>
                                        <p className="text-gray-400 text-sm">AES-256 provides protection against current and future quantum computing threats.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <h4 className="text-white font-medium mb-2">🌐 Cross-Platform Security</h4>
                                        <p className="text-gray-400 text-sm">Same security level across web, mobile, and API access methods.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <h4 className="text-white font-medium mb-2">⚡ Performance Optimized</h4>
                                        <p className="text-gray-400 text-sm">Hardware-accelerated encryption for fast performance on all devices.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compliance & Certifications */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Compliance & Certifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {complianceFeatures.map((compliance, index) => (
                                <div key={index} className="p-6 bg-white/5 rounded-lg">
                                    <h3 className="text-xl font-semibold text-white mb-3">{compliance.title}</h3>
                                    <p className="text-gray-400 mb-4">{compliance.description}</p>
                                    <ul className="space-y-2">
                                        {compliance.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start space-x-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <span className="text-gray-300 text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Best Practices */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Security Best Practices</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">For Users</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Use strong, unique passwords for your account</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Enable two-factor authentication (2FA)</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Keep your recovery information up to date</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Regularly review your message recipients</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Log out from shared devices</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">For Organizations</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Implement role-based access controls</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Regular security audits and reviews</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Employee security training programs</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Incident response planning</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-300 text-sm">Regular backup and recovery testing</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to Experience Enterprise Security?</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Join thousands of users who trust Forevr with their most sensitive information.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                    </div>
                </div>
            </main>
        </div>
    )
}
