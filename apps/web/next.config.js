/** @type {import('next').NextConfig} */
const nextConfig = {
    // appDir is now default in Next.js 14+
    images: {
        domains: ['localhost', 'vercel.app', 'supabase.co'],
        formats: ['image/webp', 'image/avif'],
    },
    // Environment variables are handled by .env.local
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
            },
        ];
    },
    webpack: (config, { isServer }) => {
        // Optimize for Three.js
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
            };
        }

        return config;
    },
};

module.exports = nextConfig;
