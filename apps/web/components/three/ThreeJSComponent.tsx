'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ThreeJSComponentProps {
    particleCount?: number
    particleSize?: number
    particleColor?: string
    animationSpeed?: number
    enableMouseInteraction?: boolean
}

export default function ThreeJSComponent({
    particleCount = 500, // Increased for more visible effect
    particleSize = 6, // Larger size to ensure visibility
    particleColor = '#60A5FA', // Brighter blue for better visibility
    animationSpeed = 0.002, // Faster, more fluid movement
    enableMouseInteraction = true
}: ThreeJSComponentProps) {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const particlesRef = useRef<{ small: THREE.Points; medium: THREE.Points; large: THREE.Points } | null>(null)
    const animationIdRef = useRef<number | null>(null)

    useEffect(() => {
        if (!mountRef.current) {
            console.log('ParticleBackground: mountRef not available')
            return
        }

        console.log('ParticleBackground: Initializing Three.js component')

        try {
            console.log('ParticleBackground: Starting initialization...')
            // Scene setup
            const scene = new THREE.Scene()
            sceneRef.current = scene
            console.log('ParticleBackground: Scene created')

            // Camera setup - positioned like the example
            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            )
            camera.position.z = 5 // Match example camera position
            console.log('ParticleBackground: Camera created')

            // Renderer setup
            const renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            })
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.setClearColor(0x000000, 0) // Completely transparent
            rendererRef.current = renderer
            console.log('ParticleBackground: Renderer created')

            // Create multiple particle systems with different sizes for visible contrast
            const smallParticles = new Float32Array((particleCount * 0.6) * 3)  // 60% small particles
            const mediumParticles = new Float32Array((particleCount * 0.3) * 3) // 30% medium particles  
            const largeParticles = new Float32Array((particleCount * 0.1) * 3)  // 10% large particles

            const color = new THREE.Color(particleColor)

            // Small particles (60% of total)
            for (let i = 0; i < smallParticles.length / 3; i++) {
                smallParticles[i * 3] = (Math.random() - 0.5) * 10
                smallParticles[i * 3 + 1] = (Math.random() - 0.5) * 10
                smallParticles[i * 3 + 2] = (Math.random() - 0.5) * 10
            }

            // Medium particles (30% of total)
            for (let i = 0; i < mediumParticles.length / 3; i++) {
                mediumParticles[i * 3] = (Math.random() - 0.5) * 10
                mediumParticles[i * 3 + 1] = (Math.random() - 0.5) * 10
                mediumParticles[i * 3 + 2] = (Math.random() - 0.5) * 10
            }

            // Large particles (10% of total)
            for (let i = 0; i < largeParticles.length / 3; i++) {
                largeParticles[i * 3] = (Math.random() - 0.5) * 10
                largeParticles[i * 3 + 1] = (Math.random() - 0.5) * 10
                largeParticles[i * 3 + 2] = (Math.random() - 0.5) * 10
            }

            // Create geometries and materials for each size
            const smallGeometry = new THREE.BufferGeometry()
            smallGeometry.setAttribute('position', new THREE.BufferAttribute(smallParticles, 3))

            const mediumGeometry = new THREE.BufferGeometry()
            mediumGeometry.setAttribute('position', new THREE.BufferAttribute(mediumParticles, 3))

            const largeGeometry = new THREE.BufferGeometry()
            largeGeometry.setAttribute('position', new THREE.BufferAttribute(largeParticles, 3))

            // Materials with different sizes - more visible variation
            const smallMaterial = new THREE.PointsMaterial({
                color: particleColor,
                size: particleSize * 0.8, // Small particles
                transparent: true,
                opacity: 0.8, // Increased opacity
                sizeAttenuation: false,
                blending: THREE.AdditiveBlending, // Changed to additive for better visibility
                depthWrite: false
            })

            const mediumMaterial = new THREE.PointsMaterial({
                color: particleColor,
                size: particleSize, // Medium particles (base size)
                transparent: true,
                opacity: 1.0, // Full opacity
                sizeAttenuation: false,
                blending: THREE.AdditiveBlending, // Changed to additive for better visibility
                depthWrite: false
            })

            const largeMaterial = new THREE.PointsMaterial({
                color: particleColor,
                size: particleSize * 1.8, // Large particles
                transparent: true,
                opacity: 1.0, // Full opacity
                sizeAttenuation: false,
                blending: THREE.AdditiveBlending, // Changed to additive for better visibility
                depthWrite: false
            })

            // Create and add all particle systems
            const smallPoints = new THREE.Points(smallGeometry, smallMaterial)
            const mediumPoints = new THREE.Points(mediumGeometry, mediumMaterial)
            const largePoints = new THREE.Points(largeGeometry, largeMaterial)

            // Store reference to all particle systems
            particlesRef.current = { small: smallPoints, medium: mediumPoints, large: largePoints }

            scene.add(smallPoints)
            scene.add(mediumPoints)
            scene.add(largePoints)
            console.log('ParticleBackground: Multiple particle systems created with different sizes')

            // Mouse interaction
            let mouseX = 0
            let mouseY = 0
            let handleMouseMove: ((event: MouseEvent) => void) | null = null

            if (enableMouseInteraction) {
                handleMouseMove = (event: MouseEvent) => {
                    mouseX = (event.clientX / window.innerWidth) * 2 - 1
                    mouseY = -(event.clientY / window.innerHeight) * 2 + 1
                }

                window.addEventListener('mousemove', handleMouseMove)
            }

            // Animation - Simple rotation like example
            const animate = () => {
                if (!particlesRef.current) return

                // Rotate all particle systems
                particlesRef.current.small.rotation.x += animationSpeed
                particlesRef.current.small.rotation.y += animationSpeed

                particlesRef.current.medium.rotation.x += animationSpeed
                particlesRef.current.medium.rotation.y += animationSpeed

                particlesRef.current.large.rotation.x += animationSpeed
                particlesRef.current.large.rotation.y += animationSpeed

                renderer.render(scene, camera)
                animationIdRef.current = requestAnimationFrame(animate)
            }

            animate()
            console.log('ParticleBackground: Animation started')

            // Handle resize
            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
            }

            window.addEventListener('resize', handleResize)

            // Mount with better positioning
            mountRef.current.appendChild(renderer.domElement)
            console.log('ParticleBackground: Canvas mounted to DOM successfully!')
            console.log('ParticleBackground: Canvas size:', renderer.domElement.width, 'x', renderer.domElement.height)

            // Cleanup
            return () => {
                console.log('ParticleBackground: Cleaning up')
                if (enableMouseInteraction && handleMouseMove) {
                    window.removeEventListener('mousemove', handleMouseMove)
                }
                window.removeEventListener('resize', handleResize)
                if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current)
                }
                if (mountRef.current && renderer.domElement) {
                    mountRef.current.removeChild(renderer.domElement)
                }
                renderer.dispose()
            }
        } catch (error) {
            console.error('ParticleBackground: Error initializing Three.js:', error)
        }
    }, [particleCount, particleSize, particleColor, animationSpeed, enableMouseInteraction])

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 pointer-events-none"
            style={{
                zIndex: -1, // Back to -1 to be behind content
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            }}
        />
    )
}
