import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Secret Safe - Your Secret Is Safe With Us',
    description: 'Privacy-first digital dead man\'s switch service with role-based access control',
    keywords: ['dead man switch', 'digital inheritance', 'privacy', 'security', 'blockchain'],
    authors: [{ name: 'Secret Safe Team' }],
    creator: 'Secret Safe',
    publisher: 'Secret Safe',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://yoursecretissafe.com'),
    openGraph: {
        title: 'Secret Safe - Your Secret Is Safe With Us',
        description: 'Privacy-first digital dead man\'s switch service with role-based access control',
        url: 'https://yoursecretissafe.com',
        siteName: 'Secret Safe',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Secret Safe - Digital Dead Man\'s Switch',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Secret Safe - Your Secret Is Safe With Us',
        description: 'Privacy-first digital dead man\'s switch service with role-based access control',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} antialiased`}>
                <div className="min-h-screen bg-gradient-to-br from-primary-dark via-secondary-dark to-primary-dark">
                    {children}
                </div>
            </body>
        </html>
    )
}
