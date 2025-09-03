import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, BookOpen, MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react'

export default function HelpCenterPage() {
    const helpCategories = [
        {
            title: "Getting Started",
            description: "Learn the basics of Forevr",
            articles: [
                "How to create your first message",
                "Setting up check-in schedules",
                "Adding recipients to messages",
                "Understanding the dashboard"
            ]
        },
        {
            title: "Account Management",
            description: "Manage your account and settings",
            articles: [
                "Creating and managing your account",
                "Updating profile information",
                "Changing password and security settings",
                "Account deletion and data export"
            ]
        },
        {
            title: "Message Management",
            description: "Create and manage your messages",
            articles: [
                "Creating encrypted messages",
                "Editing and updating messages",
                "Managing message recipients",
                "Message delivery and notifications"
            ]
        },
        {
            title: "Security & Privacy",
            description: "Understanding our security measures",
            articles: [
                "How encryption works",
                "Zero-knowledge architecture",
                "Two-factor authentication",
                "Privacy and data protection"
            ]
        },
        {
            title: "Check-in System",
            description: "Managing your check-in schedule",
            articles: [
                "Understanding check-in requirements",
                "Setting up automatic reminders",
                "What happens if you miss check-ins",
                "Grace period and message delivery"
            ]
        },
        {
            title: "Troubleshooting",
            description: "Common issues and solutions",
            articles: [
                "Login and authentication issues",
                "Message delivery problems",
                "Technical support and error messages",
                "Browser compatibility issues"
            ]
        }
    ];

    const faqs = [
        {
            question: "How does Forevr ensure my messages are secure?",
            answer: "Forevr uses client-side AES-256 encryption, meaning your messages are encrypted on your device before they ever reach our servers. We cannot read, access, or decrypt your content - only you and your intended recipients have access."
        },
        {
            question: "What happens if I forget to check in?",
            answer: "If you miss your scheduled check-ins, a grace period begins. During this time, you can still check in to prevent message delivery. After the grace period expires, your message is automatically delivered to recipients."
        },
        {
            question: "Can I change my check-in schedule after creating a message?",
            answer: "Yes, you can modify your check-in schedule at any time before the message is delivered. Simply edit the message and update the check-in interval or grace period settings."
        },
        {
            question: "How do recipients access my messages?",
            answer: "Recipients receive secure access links via email when your message is delivered. They can access the content without creating an account, and the link is time-limited for security."
        },
        {
            question: "What if I want to cancel a message before delivery?",
            answer: "You can cancel or delete any message before it's delivered. Once delivered, messages cannot be recalled, but you can contact recipients directly if needed."
        },
        {
            question: "Is there a limit to how many messages I can create?",
            answer: "Message limits depend on your subscription tier. Free users can access shared messages only, while paid tiers allow creating 5, unlimited, or unlimited messages respectively."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
            {/* Navigation */}
            <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10">
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
            <main className="pt-16 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Help
                            <span className="block text-gradient">Center</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Find answers to your questions, learn how to use Forevr,
                            and get the support you need to secure your digital legacy.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-16">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for help articles, FAQs, or topics..."
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Help Categories */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Help Categories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {helpCategories.map((category, index) => (
                                <div key={index} className="glass-card p-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
                                        <p className="text-gray-400 text-sm">{category.description}</p>
                                    </div>

                                    <ul className="space-y-2 mb-4">
                                        {category.articles.map((article, articleIndex) => (
                                            <li key={articleIndex}>
                                                <a href="#" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                                                    {article}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button variant="ghost" className="text-white hover:bg-white/10 w-full">
                                        View All Articles
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Frequently Asked Questions */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border-b border-white/10 pb-6 last:border-b-0">
                                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Still Need Help?</h2>
                        <p className="text-xl text-gray-300 text-center mb-8 max-w-3xl mx-auto">
                            Our support team is here to help you get the most out of Forevr.
                            Don't hesitate to reach out if you need assistance.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-white/5 rounded-lg">
                                <Mail className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Get detailed responses within 24 hours
                                </p>
                                <a href="mailto:support@yoursecretissafe.com" className="text-blue-400 hover:text-blue-300 text-sm">
                                    support@yoursecretissafe.com
                                </a>
                            </div>

                            <div className="text-center p-6 bg-white/5 rounded-lg">
                                <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Chat with our support team in real-time
                                </p>
                                <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                                    Start Chat
                                </Button>
                            </div>

                            <div className="text-center p-6 bg-white/5 rounded-lg">
                                <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Comprehensive guides and tutorials
                                </p>
                                <Link href="/docs" className="text-blue-400 hover:text-blue-300 text-sm">
                                    Browse Documentation
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Quick Actions</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Get started quickly with these common tasks
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/register">
                                <Button size="lg" className="btn-gradient text-lg px-8 py-4">
                                    Create Your First Message
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
