import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, MessageCircle, Phone, MapPin, Clock, Send } from 'lucide-react'

export default function ContactPage() {
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
                            Get in
                            <span className="block text-gradient">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Have questions about Forevr? Need help with your account?
                            Want to discuss enterprise solutions? We're here to help.
                        </p>
                    </div>

                    {/* Contact Methods */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        <div className="glass-card p-6 text-center">
                            <Mail className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Get detailed responses within 24 hours
                            </p>
                            <a href="mailto:support@yoursecretissafe.com" className="text-blue-400 hover:text-blue-300 text-sm">
                                support@yoursecretissafe.com
                            </a>
                        </div>

                        <div className="glass-card p-6 text-center">
                            <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Live Chat</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Chat with our support team in real-time
                            </p>
                            <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                                Start Chat
                            </Button>
                        </div>

                        <div className="glass-card p-6 text-center">
                            <Phone className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Phone Support</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Available for enterprise customers
                            </p>
                            <span className="text-blue-400 text-sm">
                                +1 (555) 123-4567
                            </span>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Send Us a Message</h2>
                        <form className="max-w-2xl mx-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-white font-medium mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                        placeholder="Your first name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-white font-medium mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                        placeholder="Your last name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-white font-medium mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-white font-medium mb-2">
                                    Subject
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="billing">Billing & Account</option>
                                    <option value="security">Security Questions</option>
                                    <option value="enterprise">Enterprise Solutions</option>
                                    <option value="partnership">Partnership Opportunities</option>
                                    <option value="feedback">Feedback & Suggestions</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-white font-medium mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-vertical"
                                    placeholder="Tell us how we can help you..."
                                    required
                                ></textarea>
                            </div>

                            <div className="text-center">
                                <Button type="submit" size="lg" className="btn-gradient text-lg px-8 py-4">
                                    <Send className="w-5 h-5 mr-2" />
                                    Send Message
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Company Information */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Company Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">About Forevr</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    Forevr is a privacy-first digital dead man's switch service that enables users
                                    to securely store and conditionally release messages to designated recipients.
                                    We're committed to protecting your digital legacy with zero-knowledge encryption
                                    and blockchain backup technology.
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-5 h-5 text-blue-400" />
                                        <span className="text-gray-300">Remote-first company, global team</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-blue-400" />
                                        <span className="text-gray-300">24/7 automated support, 24h human response</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Business Hours</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Monday - Friday</span>
                                        <span className="text-white">9:00 AM - 6:00 PM EST</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Saturday</span>
                                        <span className="text-white">10:00 AM - 4:00 PM EST</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Sunday</span>
                                        <span className="text-white">Closed</span>
                                    </div>
                                </div>

                                <h4 className="text-lg font-semibold text-white mb-3">Emergency Support</h4>
                                <p className="text-gray-400 text-sm">
                                    For urgent security or account access issues, email us with "URGENT" in the subject line.
                                    We'll respond within 2 hours during business hours.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Quick Links */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Quick Answers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Common Questions</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="/help#encryption" className="text-blue-400 hover:text-blue-300 text-sm">
                                            How does your encryption work?
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/help#checkin" className="text-blue-400 hover:text-blue-300 text-sm">
                                            What happens if I miss a check-in?
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/help#pricing" className="text-blue-400 hover:text-blue-300 text-sm">
                                            Can I change my subscription plan?
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/help#security" className="text-blue-400 hover:text-blue-300 text-sm">
                                            Is my data really secure?
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Support Resources</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="/help" className="text-blue-400 hover:text-blue-300 text-sm">
                                            Help Center & Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/how-it-works" className="text-blue-400 hover:text-blue-300 text-sm">
                                            How It Works Guide
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/security" className="text-blue-400 hover:text-blue-300 text-sm">
                                            Security & Privacy Details
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/pricing" className="text-blue-400 hover:text-blue-300 text-sm">
                                            Pricing & Plans
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Don't wait to secure your digital legacy. Start protecting your important information today.
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
