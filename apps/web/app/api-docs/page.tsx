import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Code, BookOpen, Zap, Shield, Database, Globe, Mail } from 'lucide-react'

export default function ApiDocsPage() {
    const apiEndpoints = [
        {
            method: "POST",
            path: "/api/auth/register",
            description: "Create a new user account",
            auth: "None",
            rateLimit: "5 requests per hour"
        },
        {
            method: "POST",
            path: "/api/auth/login",
            description: "Authenticate user and get access token",
            auth: "None",
            rateLimit: "10 requests per hour"
        },
        {
            method: "GET",
            path: "/api/messages",
            description: "Get user's messages",
            auth: "Bearer Token",
            rateLimit: "100 requests per hour"
        },
        {
            method: "POST",
            path: "/api/messages",
            description: "Create a new message",
            auth: "Bearer Token",
            rateLimit: "50 requests per hour"
        },
        {
            method: "PUT",
            path: "/api/messages/{id}",
            description: "Update an existing message",
            auth: "Bearer Token",
            rateLimit: "50 requests per hour"
        },
        {
            method: "DELETE",
            path: "/api/messages/{id}",
            description: "Delete a message",
            auth: "Bearer Token",
            rateLimit: "50 requests per hour"
        },
        {
            method: "POST",
            path: "/api/check-in",
            description: "Perform a check-in",
            auth: "Bearer Token",
            rateLimit: "100 requests per hour"
        },
        {
            method: "GET",
            path: "/api/public/message/{token}",
            description: "Access a public message (for recipients)",
            auth: "None",
            rateLimit: "1000 requests per hour"
        }
    ];

    const codeExamples = [
        {
            language: "JavaScript",
            title: "Create a new message",
            code: `const response = await fetch('/api/messages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Your encrypted message content',
    recipients: ['recipient@example.com'],
    checkInInterval: 7,
    gracePeriod: 3
  })
});

const message = await response.json();`
        },
        {
            language: "Python",
            title: "Authenticate and get messages",
            code: `import requests

# Login to get access token
auth_response = requests.post('https://api.yoursecretissafe.com/api/auth/login', {
    'email': 'user@example.com',
    'password': 'your_password'
})

token = auth_response.json()['access_token']

# Get user's messages
headers = {'Authorization': f'Bearer {token}'}
messages_response = requests.get('https://api.yoursecretissafe.com/api/messages', headers=headers)
messages = messages_response.json()`
        },
        {
            language: "cURL",
            title: "Perform a check-in",
            code: `curl -X POST https://api.yoursecretissafe.com/api/check-in \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"messageId": "message-uuid-here"}'`
        }
    ];

    const sdkFeatures = [
        {
            icon: Shield,
            title: "Automatic Encryption",
            description: "Client-side encryption handled automatically by our SDKs"
        },
        {
            icon: Zap,
            title: "Rate Limiting",
            description: "Built-in rate limiting and retry logic for optimal performance"
        },
        {
            icon: Database,
            title: "Offline Support",
            description: "Queue operations when offline and sync when connection returns"
        },
        {
            icon: Globe,
            title: "Multi-Language",
            description: "Official SDKs for JavaScript, Python, and more coming soon"
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
                            API
                            <span className="block text-gradient">Documentation</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Integrate Forevr into your applications with our comprehensive REST API.
                            Build secure, automated systems for digital legacy management.
                        </p>
                    </div>

                    {/* Quick Start */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Quick Start</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-4xl mb-4">🔑</div>
                                <h3 className="text-xl font-semibold text-white mb-3">1. Get API Key</h3>
                                <p className="text-gray-400 text-sm">
                                    Sign up for a Professional or Admin account to access the API
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-4xl mb-4">📚</div>
                                <h3 className="text-xl font-semibold text-white mb-3">2. Read Docs</h3>
                                <p className="text-gray-400 text-sm">
                                    Review our API endpoints and authentication methods
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-4xl mb-4">🚀</div>
                                <h3 className="text-xl font-semibold text-white mb-3">3. Start Building</h3>
                                <p className="text-gray-400 text-sm">
                                    Use our SDKs or make direct HTTP requests
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* API Endpoints */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">API Endpoints</h2>
                        <div className="space-y-4">
                            {apiEndpoints.map((endpoint, index) => (
                                <div key={index} className="glass-card p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                                            endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                                                endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {endpoint.method}
                                        </span>
                                        <code className="text-white font-mono bg-white/10 px-3 py-1 rounded">
                                            {endpoint.path}
                                        </code>
                                    </div>

                                    <p className="text-gray-300 mb-3">{endpoint.description}</p>

                                    <div className="flex items-center space-x-6 text-sm">
                                        <span className="text-gray-400">
                                            <strong>Auth:</strong> {endpoint.auth}
                                        </span>
                                        <span className="text-gray-400">
                                            <strong>Rate Limit:</strong> {endpoint.rateLimit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Code Examples */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Code Examples</h2>
                        <div className="space-y-8">
                            {codeExamples.map((example, index) => (
                                <div key={index}>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Code className="w-5 h-5 text-blue-400" />
                                        <h3 className="text-xl font-semibold text-white">{example.title}</h3>
                                        <span className="px-2 py-1 bg-white/10 text-gray-300 text-sm rounded">
                                            {example.language}
                                        </span>
                                    </div>

                                    <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-gray-300 text-sm">
                                            <code>{example.code}</code>
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SDK Features */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">SDK Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sdkFeatures.map((feature, index) => (
                                <div key={index} className="glass-card p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <feature.icon className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                            <p className="text-gray-400">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Authentication */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Authentication</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Bearer Token Authentication</h3>
                                <p className="text-gray-400 mb-4">
                                    All API requests require a valid Bearer token in the Authorization header.
                                    Tokens are obtained through the login endpoint and expire after 24 hours.
                                </p>

                                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                                    <pre className="text-gray-300 text-sm">
                                        <code>Authorization: Bearer YOUR_ACCESS_TOKEN</code>
                                    </pre>
                                </div>

                                <p className="text-gray-400 text-sm">
                                    Include this header with every authenticated request to access protected endpoints.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Rate Limiting</h3>
                                <p className="text-gray-400 mb-4">
                                    API requests are rate-limited to ensure fair usage and system stability.
                                    Limits vary by endpoint and user tier.
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Free Tier</span>
                                        <span className="text-white">100 requests/hour</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Professional</span>
                                        <span className="text-white">1,000 requests/hour</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Admin</span>
                                        <span className="text-white">10,000 requests/hour</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Handling */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Error Handling</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">HTTP Status Codes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <div className="text-green-400 font-mono text-sm">2xx Success</div>
                                        <div className="text-gray-400 text-sm">Request completed successfully</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <div className="text-blue-400 font-mono text-sm">4xx Client Error</div>
                                        <div className="text-gray-400 text-sm">Invalid request or authentication</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <div className="text-yellow-400 font-mono text-sm">429 Rate Limited</div>
                                        <div className="text-gray-400 text-sm">Too many requests</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <div className="text-red-400 font-mono text-sm">5xx Server Error</div>
                                        <div className="text-gray-400 text-sm">Internal server error</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Error Response Format</h3>
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <pre className="text-gray-300 text-sm">
                                        <code>{`{
  "error": "error_type",
  "message": "Human readable error message",
  "details": {
    "field": "Additional error details"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}`}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SDK Downloads */}
                    <div className="glass-card p-8 mb-16">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">SDK Downloads</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-white/5 rounded-lg">
                                <div className="text-4xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-white mb-2">JavaScript/Node.js</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Official SDK for web and Node.js applications
                                </p>
                                <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                                    Coming Soon
                                </Button>
                            </div>

                            <div className="text-center p-6 bg-white/5 rounded-lg">
                                <div className="text-4xl mb-4">🐍</div>
                                <h3 className="text-xl font-semibold text-white mb-2">Python</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Python SDK for automation and scripting
                                </p>
                                <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                                    Coming Soon
                                </Button>
                            </div>

                            <div className="text-center p-6 bg-white/5 rounded-lg">
                                <div className="text-4xl mb-4">🔧</div>
                                <h3 className="text-xl font-semibold text-white mb-2">REST API</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Direct HTTP API for any programming language
                                </p>
                                <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                                    Available Now
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to Integrate?</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Start building with our API today. Get access to professional features and higher rate limits.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/register">
                                <Button size="lg" className="btn-gradient text-lg px-8 py-4">
                                    Get API Access
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
