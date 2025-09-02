import React from 'react'

interface ForevrLogoProps {
    variant?: 'full' | 'compact' | 'icon'
    className?: string
    width?: number
    height?: number
}

export const ForevrLogo: React.FC<ForevrLogoProps> = ({
    variant = 'compact',
    className = '',
    width,
    height
}) => {
    const getLogoSrc = () => {
        switch (variant) {
            case 'full':
                return '/logo-forevr.svg'
            case 'compact':
                return '/logo-forevr-compact.svg'
            case 'icon':
                return '/logo-forevr-icon.svg'
            default:
                return '/logo-forevr-compact.svg'
        }
    }

    const getDefaultDimensions = () => {
        switch (variant) {
            case 'full':
                return { width: 200, height: 60 }
            case 'compact':
                return { width: 120, height: 40 }
            case 'icon':
                return { width: 32, height: 32 }
            default:
                return { width: 120, height: 40 }
        }
    }

    const dimensions = getDefaultDimensions()
    const finalWidth = width || dimensions.width
    const finalHeight = height || dimensions.height

    return (
        <img
            src={getLogoSrc()}
            alt="Forevr Logo"
            width={finalWidth}
            height={finalHeight}
            className={className}
        />
    )
}

export default ForevrLogo


