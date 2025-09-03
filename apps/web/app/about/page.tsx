import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Shield, Globe, Users, Target, Award, Mail, Lock, Rocket } from 'lucide-react'

export default function AboutPage() {
    const values = [
        {
            icon: Shield,
            title: "Security First",
            description: "We believe that privacy and security are fundamental human rights. Every decision we make prioritizes protecting your information."
        },
        {
            icon: Heart,
            title: "User-Centric",
            description: "Our users are at the heart of everything we do. We build features based on real needs and feedback from our community."
        },
        {
            icon: Globe,
            title: "Global Accessibility",
            description: "We're committed to making secure digital legacy planning accessible to everyone, regardless of technical expertise or location."
        },
        {
            icon: Users,
            title: "Community Driven",
            description: "We believe in the power of community. Our users help shape the platform and support each other in their digital planning journey."
        }
    ];

    const team = [
        {
            name: "Olivier De Decker",
            role: "Founder & Lead Developer",
            bio: "Passionate about privacy, security, and building technology that serves people. Leading the development of Forevr with a focus on user experience and security.",
            expertise: ["Full-Stack Development", "Security Architecture", "User Experience Design", "Blockchain Technology"]
        }
    ];

    const milestones = [
        {
            year: "2025",
            title: "Project Inception",
            description: "Forevr concept developed with focus on privacy-first digital legacy planning"
        },
        {
            year: "2025",
            title: "MVP Development",
            description: "Core platform development with role-based access system and zero-knowledge encryption"
        },
        {
            year: "2025",
            title: "Beta Launch",
            description: "Limited beta release with early adopters and security testing"
        },
        {
            year: "2026",
            title: "Public Launch",
            description: "Full public release with all planned features and blockchain backup options"
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
                            <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
                                Security
                            </Link>
                            <Link href="/about" className="text-primary-blue-light font-medium">
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
                            About
                            <span className="block text-gradient">Forevr</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            We're building the most trusted platform for digital legacy planning,
                            combining cutting-edge security with simple, accessible technology.
                        </p>
                    </div>

                    {/* Mission Statement */}
                    <div className="glass-card p-8 mb-16">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                                To become the most trusted and reliable platform for securing and delivering critical information
                                when it matters most, providing peace of mind through technology that outlives any single company.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">The Problem We Solve</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    In today's digital world, we accumulate vast amounts of important information - passwords,
                                    personal messages, legal documents, and digital assets. But what happens to this information
                                    if something happens to us? Traditional solutions are either too complex, not secure enough,
                                    or don't guarantee delivery.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Our Solution</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Forevr provides a simple, secure way to ensure your important messages reach the right people.
                                    Using zero-knowledge encryption and blockchain backup technology, we've created a platform that's
                                    both incredibly secure and remarkably easy to use.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Core Values */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {values.map((value, index) => (
                                <div key={index} className="glass-card p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <value.icon className="w-8 h-8" style={{ color: '#60a5fa' }} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                                            <p className="text-gray-400">{value.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Meet Our Team</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                            {team.map((member, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                                        <span className="text-3xl text-white font-bold">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white mb-2">{member.name}</h3>
                                    <p className="text-primary-blue-light mb-4">{member.role}</p>
                                    <p className="text-gray-400 mb-6 max-w-2xl mx-auto">{member.bio}</p>

                                    <div className="flex flex-wrap justify-center gap-2">
                                        {member.expertise.map((skill, skillIndex) => (
                                            <span
                                                key={skillIndex}
                                                className="px-3 py-1 bg-white/10 text-white text-sm rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Development Philosophy */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Development Philosophy</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    <Target className="h-12 w-12" style={{ color: '#60a5fa' }} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">User-First Design</h3>
                                <p className="text-gray-400 text-sm">
                                    Every feature is designed with the end user in mind. We prioritize simplicity
                                    and accessibility over complex technical solutions.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    <Lock className="h-12 w-12" style={{ color: '#60a5fa' }} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">Security by Default</h3>
                                <p className="text-gray-400 text-sm">
                                    Security isn't an afterthought - it's built into every layer of our platform
                                    from the ground up, ensuring your data is always protected.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    <Rocket className="h-12 w-12" style={{ color: '#60a5fa' }} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">Continuous Improvement</h3>
                                <p className="text-gray-400 text-sm">
                                    We're constantly learning, iterating, and improving based on user feedback
                                    and emerging security best practices.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Roadmap & Milestones */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Development Roadmap</h2>
                        <div className="space-y-6">
                            {milestones.map((milestone, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {milestone.year}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">{milestone.title}</h3>
                                        <p className="text-gray-400">{milestone.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Technology Stack */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Technology Stack</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Frontend</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">Next.js 14 with React 18</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">TypeScript for type safety</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">Tailwind CSS for styling</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">Three.js for 3D effects</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Backend & Infrastructure</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">FastAPI with Python 3.11+</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">Supabase for database & auth</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">Vercel for hosting & deployment</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">Blockchain backup (IPFS + Arweave)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Join Us on This Journey</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            We're building something special, and we'd love for you to be part of it.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/register">
                                <Button size="lg" className="btn-gradient text-lg px-8 py-4">
                                    Get Started Today
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
