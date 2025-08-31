import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function PricingPage() {
    const pricingTiers = [
        {
            name: "Reader",
            price: "Free",
            description: "Access to shared messages only",
            features: [
                "Access to shared messages only",
                "Basic read receipts",
                "Limited profile management",
                "Email support only"
            ],
            cta: "Get Started",
            href: "/auth/register",
            popular: false
        },
        {
            name: "Writer",
            price: "$5",
            period: "/month",
            description: "Perfect for individuals and families",
            features: [
                "5 active messages",
                "Flexible check-in schedules",
                "Email + SMS delivery",
                "File attachments (10MB)",
                "Can share with Reader users",
                "Standard support"
            ],
            cta: "Start Writing",
            href: "/auth/register",
            popular: true
        },
        {
            name: "Professional",
            price: "$15",
            period: "/month",
            description: "For power users and small businesses",
            features: [
                "Unlimited messages",
                "All check-in options",
                "Priority delivery",
                "File attachments (100MB)",
                "API access (read-only)",
                "Advanced sharing options",
                "Priority support"
            ],
            cta: "Go Professional",
            href: "/auth/register",
            popular: false
        },
        {
            name: "Admin",
            price: "$25",
            period: "/month",
            description: "Complete platform management",
            features: [
                "Everything in Professional",
                "User management capabilities",
                "System analytics access",
                "Audit logs",
                "Role management",
                "Full API access",
                "White-label options (enterprise)"
            ],
            cta: "Become Admin",
            href: "/auth/register",
            popular: false
        }
    ];

    const blockchainTier = {
        name: "Ultimate Blockchain",
        price: "$99",
        period: " one-time per message",
        description: "Permanent blockchain storage with complete autonomy",
        features: [
            "Available for any role",
            "Permanent blockchain storage",
            "Decentralized monitoring via smart contracts",
            "Works even if company disappears",
            "Chainlink Keeper automation (10 years)",
            "IPFS + Arweave permanent storage",
            "ENS subdomain for access",
            "Complete autonomy guarantee"
        ],
        cta: "Learn More",
        href: "/how-it-works",
        popular: false
    };

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
                            <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                                How It Works
                            </Link>
                            <Link href="/pricing" className="text-blue-400 font-medium">
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
                            Simple, Transparent
                            <span className="block text-gradient">Pricing</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Choose the plan that fits your needs. All plans include our core security features
                            and zero-knowledge encryption. No hidden fees, no surprises.
                        </p>
                    </div>

                    {/* Pricing Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {pricingTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`glass-card p-6 relative ${tier.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                                    <div className="mb-2">
                                        <span className="text-3xl font-bold text-white">{tier.price}</span>
                                        {tier.period && (
                                            <span className="text-gray-400 text-lg">{tier.period}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm">{tier.description}</p>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {tier.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start space-x-3">
                                            <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href={tier.href} className="w-full">
                                    <Button
                                        className={`w-full ${tier.popular
                                                ? 'btn-gradient'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        {tier.cta}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Blockchain Tier */}
                    <div className="glass-card p-8 mb-16">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-4">Ultimate Blockchain Protection</h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                For messages that must survive even if our company disappears.
                                Complete decentralization and permanent storage.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="mb-6">
                                    <div className="text-4xl font-bold text-white mb-2">
                                        {blockchainTier.price}
                                        <span className="text-2xl text-gray-400">{blockchainTier.period}</span>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white mb-2">{blockchainTier.name}</h3>
                                    <p className="text-gray-400">{blockchainTier.description}</p>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {blockchainTier.features.map((feature, index) => (
                                        <li key={index} className="flex items-start space-x-3">
                                            <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href={blockchainTier.href}>
                                    <Button variant="ghost" className="text-white hover:bg-white/10">
                                        {blockchainTier.cta}
                                    </Button>
                                </Link>
                            </div>

                            <div className="text-center">
                                <div className="text-6xl mb-4">🌐</div>
                                <h3 className="text-xl font-semibold text-white mb-3">Why Blockchain Backup?</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Traditional cloud services can disappear, companies can shut down,
                                    and servers can fail. Our blockchain backup ensures your messages
                                    survive any scenario, operating autonomously through smart contracts
                                    and decentralized storage networks.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Can I change my plan later?</h3>
                                <p className="text-gray-400">
                                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect
                                    immediately and are prorated for the current billing period.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">What happens if I miss a payment?</h3>
                                <p className="text-gray-400">
                                    We'll send you reminders before your subscription expires. If payment fails,
                                    your account will be suspended but your messages remain safe. Reactivate anytime
                                    by updating your payment method.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
                                <p className="text-gray-400">
                                    Yes! Start with our free Reader tier to experience the platform.
                                    You can upgrade to any paid plan when you're ready to create messages.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
                                <p className="text-gray-400">
                                    We offer a 30-day money-back guarantee for all paid plans.
                                    If you're not satisfied, contact us for a full refund.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Join thousands of users who trust Secret Safe with their most important messages.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/register">
                                <Button size="lg" className="btn-gradient text-lg px-8 py-4">
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Link href="/how-it-works">
                                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 text-lg px-8 py-4">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
