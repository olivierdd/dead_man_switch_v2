'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Three.js to prevent SSR issues
const ThreeJSComponent = dynamic(() => import('./ThreeJSComponent'), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black" />
})

interface ParticleBackgroundProps {
    particleCount?: number
    particleSize?: number
    particleColor?: string
    animationSpeed?: number
    enableMouseInteraction?: boolean
}

export function ParticleBackground(props: ParticleBackgroundProps) {
    return <ThreeJSComponent {...props} />
}

