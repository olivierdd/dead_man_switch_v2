'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ParticleBackgroundProps {
    particleCount?: number
    particleSize?: number
    particleColor?: string
    animationSpeed?: number
    enableMouseInteraction?: boolean
}

export function ParticleBackground({
    particleCount = 1000,
    particleSize = 2,
    particleColor = '#3B82F6',
    animationSpeed = 0.5,
    enableMouseInteraction = true
}: ParticleBackgroundProps) {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const particlesRef = useRef<THREE.Points | null>(null)
    const animationIdRef = useRef<number | null>(null)

    useEffect(() => {
        if (!mountRef.current) return

        // Scene setup
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        camera.position.z = 50

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 0)
        rendererRef.current = renderer

        // Create particles
        const particles = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)

        const color = new THREE.Color(particleColor)

        for (let i = 0; i < particleCount; i++) {
            // Position
            particles[i * 3] = (Math.random() - 0.5) * 200     // x
            particles[i * 3 + 1] = (Math.random() - 0.5) * 200 // y
            particles[i * 3 + 2] = (Math.random() - 0.5) * 200 // z

            // Color
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const material = new THREE.PointsMaterial({
            size: particleSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        })

        const points = new THREE.Points(geometry, material)
        particlesRef.current = points
        scene.add(points)

        // Mouse interaction
        let mouseX = 0
        let mouseY = 0

        if (enableMouseInteraction) {
            const handleMouseMove = (event: MouseEvent) => {
                mouseX = (event.clientX / window.innerWidth) * 2 - 1
                mouseY = -(event.clientY / window.innerHeight) * 2 + 1
            }

            window.addEventListener('mousemove', handleMouseMove)

            // Cleanup
            return () => {
                window.removeEventListener('mousemove', handleMouseMove)
            }
        }

        // Animation
        const animate = () => {
            if (!particlesRef.current) return

            const time = Date.now() * 0.001 * animationSpeed

            // Rotate particles
            particlesRef.current.rotation.x = time * 0.1
            particlesRef.current.rotation.y = time * 0.15

            // Mouse interaction effect
            if (enableMouseInteraction) {
                particlesRef.current.rotation.x += mouseY * 0.1
                particlesRef.current.rotation.y += mouseX * 0.1
            }

            // Float particles upward
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += 0.01
                if (positions[i] > 100) {
                    positions[i] = -100
                }
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true

            renderer.render(scene, camera)
            animationIdRef.current = requestAnimationFrame(animate)
        }

        animate()

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener('resize', handleResize)

        // Mount
        mountRef.current.appendChild(renderer.domElement)

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current)
            }
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement)
            }
            renderer.dispose()
        }
    }, [particleCount, particleSize, particleColor, animationSpeed, enableMouseInteraction])

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: -1 }}
        />
    )
}

