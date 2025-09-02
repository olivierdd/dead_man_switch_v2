import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Eye, Cookie, Globe, Lock, Mail } from 'lucide-react'

export default function TermsPage() {
    const legalSections = [
        {
            id: "terms",
            title: "Terms of Service",
            icon: Shield,
            content: [
                {
                    subtitle: "Acceptance of Terms",
                    text: "By accessing and using Forevr, you accept and agree to be bound by the terms and provision of this agreement."
                },
                {
                    subtitle: "Service Description",
                    text: "Forevr is a digital legacy protection service that enables users to securely store and conditionally release messages to designated recipients."
                },
                {
                    subtitle: "User Responsibilities",
                    text: "Users are responsible for maintaining their check-in schedule, ensuring accurate recipient information, and complying with all applicable laws."
                },
                {
                    subtitle: "Service Limitations",
                    text: "While we strive for 100% reliability, we cannot guarantee message delivery in all circumstances. Users should have backup plans for critical information."
                },
                {
                    subtitle: "Termination",
                    text: "We reserve the right to terminate or suspend accounts that violate our terms of service or engage in fraudulent activities."
                }
            ]
        },
        {
            id: "privacy",
            title: "Privacy Policy",
            icon: Eye,
            content: [
                {
                    subtitle: "Information We Collect",
                    text: "We collect minimal information necessary to provide our service: email addresses, encrypted message content, and usage analytics. We do not collect or store personal message content in readable form."
                },
                {
                    subtitle: "How We Use Information",
                    text: "Your information is used solely to provide the Forevr service, including account management, message delivery, and customer support."
                },
                {
                    subtitle: "Information Sharing",
                    text: "We do not sell, trade, or otherwise transfer your personal information to third parties, except as required by law or with your explicit consent."
                },
                {
                    subtitle: "Data Retention",
                    text: "We retain your account information for as long as your account is active. You may request deletion of your data at any time."
                },
                {
                    subtitle: "Your Rights",
                    text: "You have the right to access, correct, or delete your personal information, and to withdraw consent for data processing."
                }
            ]
        },
        {
            id: "cookies",
            title: "Cookie Policy",
            icon: Cookie,
            content: [
                {
                    subtitle: "What Are Cookies",
                    text: "Cookies are small text files stored on your device that help us provide and improve our service."
                },
                {
                    subtitle: "How We Use Cookies",
                    text: "We use cookies for authentication, session management, and to remember your preferences. We do not use cookies for tracking or advertising purposes."
                },
                {
                    subtitle: "Types of Cookies",
                    text: "Essential cookies are required for the service to function. Functional cookies improve user experience. Analytics cookies help us understand service usage."
                },
                {
                    subtitle: "Cookie Management",
                    text: "You can control and delete cookies through your browser settings. Disabling cookies may affect service functionality."
                }
            ]
        },
        {
            id: "gdpr",
            title: "GDPR Compliance",
            icon: Globe,
            content: [
                {
                    subtitle: "Data Controller",
                    text: "Forevr acts as the data controller for personal information collected through our service."
                },
                {
                    subtitle: "Legal Basis",
                    text: "We process your data based on legitimate interest in providing our service and your consent for optional features."
                },
                {
                    subtitle: "Data Subject Rights",
                    text: "Under GDPR, you have the right to access, rectification, erasure, portability, and restriction of processing of your personal data."
                },
                {
                    subtitle: "Data Protection Officer",
                    text: "For GDPR-related inquiries, contact our Data Protection Officer at dpo@yoursecretissafe.com."
                },
                {
                    subtitle: "International Transfers",
                    text: "Your data may be processed in countries outside the EU. We ensure adequate protection through appropriate safeguards."
                }
            ]
        },
        {
            id: "security",
            title: "Security Policy",
            icon: Lock,
            content: [
                {
                    subtitle: "Encryption Standards",
                    text: "We use AES-256 encryption for all message content. Encryption occurs client-side before data transmission to our servers."
                },
                {
                    subtitle: "Zero-Knowledge Architecture",
                    text: "Our system is designed so that we cannot read, access, or decrypt your message content. Only you and your intended recipients have access."
                },
                {
                    subtitle: "Access Controls",
                    text: "We implement strict access controls, multi-factor authentication, and regular security audits to protect your information."
                },
                {
                    subtitle: "Incident Response",
                    text: "In the event of a security incident, we will notify affected users within 72 hours and take immediate action to mitigate risks."
                },
                {
                    subtitle: "Vulnerability Reporting",
                    text: "We welcome security researchers to report vulnerabilities to security@yoursecretissafe.com. We do not offer bug bounties at this time."
                }
            ]
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

            {/* Main Content */}
            <main className="pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Legal &
                            <span className="block text-gradient">Privacy</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Complete transparency about how we protect your data, handle your privacy,
                            and ensure the security of your digital legacy.
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {legalSections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <section.icon className="w-5 h-5" />
                                <span>{section.title}</span>
                            </a>
                        ))}
                    </div>

                    {/* Legal Content */}
                    <div className="space-y-16">
                        {legalSections.map((section) => (
                            <div key={section.id} id={section.id} className="glass-card p-8">
                                <div className="flex items-center space-x-4 mb-8">
                                    <section.icon className="w-8 h-8 text-blue-400" />
                                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                                </div>

                                <div className="space-y-6">
                                    {section.content.map((item, index) => (
                                        <div key={index}>
                                            <h3 className="text-xl font-semibold text-white mb-3">
                                                {item.subtitle}
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Legal Information */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Additional Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                                <div className="space-y-3 text-gray-400">
                                    <p><strong>General Inquiries:</strong> support@yoursecretissafe.com</p>
                                    <p><strong>Privacy Questions:</strong> privacy@yoursecretissafe.com</p>
                                    <p><strong>Security Issues:</strong> security@yoursecretissafe.com</p>
                                    <p><strong>Legal Matters:</strong> legal@yoursecretissafe.com</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Updates & Changes</h3>
                                <div className="space-y-3 text-gray-400">
                                    <p>We may update these policies from time to time. Significant changes will be communicated via email.</p>
                                    <p>Last updated: January 1, 2025</p>
                                    <p>Version: 1.0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Questions About Our Policies?</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            We're committed to transparency and protecting your rights. Contact us if you need clarification.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact">
                                <Button size="lg" className="btn-gradient text-lg px-8 py-4">
                                    Contact Support
                                </Button>
                            </Link>
                            <Link href="/help">
                                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 text-lg px-8 py-4">
                                    Help Center
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
