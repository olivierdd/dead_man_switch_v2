import type { Metadata } from 'next'
import { Inter, Archivo_Black } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })
const archivoBlack = Archivo_Black({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-archivo-black'
})

export const metadata: Metadata = {
    title: 'Forevr - Your Secret Is Safe With Us',
    description: 'Privacy-first digital dead man\'s switch service with role-based access control',
    keywords: ['dead man switch', 'digital inheritance', 'privacy', 'security', 'blockchain'],
    authors: [{ name: 'Forevr Team' }],
    creator: 'Forevr',
    publisher: 'Forevr',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://yoursecretissafe.com'),
    openGraph: {
        title: 'Forevr - Your Secret Is Safe With Us',
        description: 'Privacy-first digital dead man\'s switch service with role-based access control',
        url: 'https://yoursecretissafe.com',
        siteName: 'Forevr',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Forevr - Digital Dead Man\'s Switch',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Forevr - Your Secret Is Safe With Us',
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
            <body className={`${inter.className} ${archivoBlack.variable} antialiased`}>
                <div className="min-h-screen bg-gradient-to-br from-primary-dark via-secondary-dark to-primary-dark">
                    {children}
                </div>
            </body>
        </html>
    )
}
