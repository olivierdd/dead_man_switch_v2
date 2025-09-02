/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                'archivo-black': ['var(--font-archivo-black)', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Core Colors - Primary Blues
                'primary-blue': '#3B82F6',
                'primary-blue-light': '#60A5FA',
                'primary-blue-dark': '#2563EB',
                'primary-blue-darker': '#1D4ED8',

                // Primary Purples
                'primary-purple': '#8B5CF6',
                'primary-purple-light': '#A78BFA',
                'primary-purple-dark': '#7C3AED',
                'primary-purple-darker': '#6D28D9',

                // Extended Palette - Neutrals
                'black': '#0A0E27',
                'gray-900': '#151A3A',
                'gray-800': '#1E293B',
                'gray-700': '#334155',
                'gray-600': '#475569',
                'gray-500': '#64748B',
                'gray-400': '#94A3B8',
                'gray-300': '#CBD5E1',
                'gray-200': '#E2E8F0',
                'gray-100': '#F1F5F9',
                'white': '#FFFFFF',

                // Accent Colors
                'cyan': '#06B6D4',
                'cyan-light': '#22D3EE',
                'cyan-dark': '#0891B2',
                'teal': '#14B8A6',
                'indigo': '#6366F1',

                // Semantic Colors
                'success': '#10B981',
                'success-light': '#34D399',
                'warning': '#F59E0B',
                'warning-light': '#FBBF24',
                'error': '#EF4444',
                'error-light': '#F87171',
                'info': '#3B82F6',

                // Background Variations
                'surface-1': '#0F172A',
                'surface-2': '#1E293B',
                'surface-3': '#334155',

                // Glass Effects
                'glass-white': 'rgba(255, 255, 255, 0.1)',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
                'glass-border-hover': 'rgba(255, 255, 255, 0.2)',

                // Gradients
                'gradient-start': '#3B82F6',
                'gradient-end': '#8B5CF6',

                // Legacy colors for backward compatibility
                'primary-dark': '#0A0E27',
                'secondary-dark': '#151A3A',
                'accent-blue': '#3B82F6',
                'accent-cyan': '#06B6D4',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
                    "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" },
                },
                "particle-float": {
                    "0%": { transform: "translateY(0px) rotate(0deg)" },
                    "100%": { transform: "translateY(-100px) rotate(360deg)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "float": "float 6s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite",
                "particle-float": "particle-float 20s linear infinite",
            },
            backdropBlur: {
                xs: '2px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
                'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
            },
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
    ],
}

