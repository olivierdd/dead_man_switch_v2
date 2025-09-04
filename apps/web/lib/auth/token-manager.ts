/**
 * JWT Token Management Service
 * Handles secure storage, refresh, and lifecycle management of authentication tokens
 */

export interface TokenData {
    accessToken: string
    refreshToken: string
    expiresAt: number
    issuedAt: number
}

export interface TokenPayload {
    sub: string // User ID
    email: string
    role: string
    exp: number // Expiration timestamp
    iat: number // Issued at timestamp
    jti: string // JWT ID
}

export class TokenManager {
    private static readonly ACCESS_TOKEN_KEY = 'secret_safe_access_token'
    private static readonly REFRESH_TOKEN_KEY = 'secret_safe_refresh_token'
    private static readonly TOKEN_EXPIRY_KEY = 'secret_safe_token_expiry'
    private static readonly TOKEN_ISSUED_KEY = 'secret_safe_token_issued'

    // Token expiration thresholds (in milliseconds)
    private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry
    private static readonly CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours after expiry

    /**
     * Store authentication tokens securely
     */
    static storeTokens(accessToken: string, refreshToken: string): void {
        try {
            // Decode access token to get expiration and issued times
            const accessPayload = this.decodeToken(accessToken)

            if (!accessPayload) {
                throw new Error('Invalid access token format')
            }

            // Only decode refresh token if it's provided and not empty
            let refreshPayload = null
            if (refreshToken && refreshToken.trim() !== '') {
                refreshPayload = this.decodeToken(refreshToken)
                if (!refreshPayload) {
                    console.warn('Invalid refresh token format, storing without refresh token')
                }
            }

            // Store tokens with metadata
            this.setSecureItem(this.ACCESS_TOKEN_KEY, accessToken)
            if (refreshToken && refreshToken.trim() !== '') {
                this.setSecureItem(this.REFRESH_TOKEN_KEY, refreshToken)
            }
            this.setSecureItem(this.TOKEN_EXPIRY_KEY, accessPayload.exp.toString())
            this.setSecureItem(this.TOKEN_ISSUED_KEY, accessPayload.iat.toString())

            // Set up automatic cleanup
            this.scheduleCleanup(accessPayload.exp)

        } catch (error) {
            console.error('Failed to store tokens:', error)
            this.clearTokens()
            throw error
        }
    }

    /**
     * Retrieve the current access token
     */
    static getAccessToken(): string | null {
        try {
            const token = this.getSecureItem(this.ACCESS_TOKEN_KEY)
            if (!token) return null

            // Check if token is expired
            if (this.isTokenExpired(token)) {
                this.clearTokens()
                return null
            }

            return token
        } catch (error) {
            console.error('Failed to retrieve access token:', error)
            return null
        }
    }

    /**
     * Retrieve the current refresh token
     */
    static getRefreshToken(): string | null {
        try {
            const token = this.getSecureItem(this.REFRESH_TOKEN_KEY)
            if (!token) return null

            // Check if refresh token is expired
            if (this.isTokenExpired(token)) {
                this.clearTokens()
                return null
            }

            return token
        } catch (error) {
            console.error('Failed to retrieve refresh token:', error)
            return null
        }
    }

    /**
     * Check if current access token needs refresh
     */
    static shouldRefreshToken(): boolean {
        try {
            const token = this.getAccessToken()
            if (!token) return false

            const payload = this.decodeToken(token)
            if (!payload) return false

            const now = Math.floor(Date.now() / 1000)
            const timeUntilExpiry = payload.exp - now

            // Refresh if token expires within the threshold
            return timeUntilExpiry <= (this.REFRESH_THRESHOLD / 1000)
        } catch (error) {
            console.error('Failed to check token refresh status:', error)
            return true
        }
    }

    /**
     * Check if user is authenticated with valid tokens
     */
    static isAuthenticated(): boolean {
        try {
            const accessToken = this.getAccessToken()
            const refreshToken = this.getRefreshToken()

            return !!(accessToken && refreshToken)
        } catch (error) {
            console.error('Failed to check authentication status:', error)
            return false
        }
    }

    /**
     * Get token payload data
     */
    static getTokenPayload(token: string): TokenPayload | null {
        try {
            return this.decodeToken(token)
        } catch (error) {
            console.error('Failed to decode token payload:', error)
            return null
        }
    }

    /**
     * Get current user ID from access token
     */
    static getCurrentUserId(): string | null {
        try {
            const token = this.getAccessToken()
            if (!token) return null

            const payload = this.decodeToken(token)
            return payload?.sub || null
        } catch (error) {
            console.error('Failed to get current user ID:', error)
            return null
        }
    }

    /**
     * Get current user role from access token
     */
    static getCurrentUserRole(): string | null {
        try {
            const token = this.getAccessToken()
            if (!token) return null

            const payload = this.decodeToken(token)
            return payload?.role || null
        } catch (error) {
            console.error('Failed to get current user role:', error)
            return null
        }
    }

    /**
     * Clear all stored tokens
     */
    static clearTokens(): void {
        try {
            // Remove from localStorage
            localStorage.removeItem(this.ACCESS_TOKEN_KEY)
            localStorage.removeItem(this.REFRESH_TOKEN_KEY)
            localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
            localStorage.removeItem(this.TOKEN_ISSUED_KEY)

            // Remove from sessionStorage as backup
            sessionStorage.removeItem(this.ACCESS_TOKEN_KEY)
            sessionStorage.removeItem(this.REFRESH_TOKEN_KEY)
            sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY)
            sessionStorage.removeItem(this.TOKEN_ISSUED_KEY)

            // Clear cookies
            this.clearCookies()

            // Clear any scheduled cleanup
            this.clearScheduledCleanup()

        } catch (error) {
            console.error('Failed to clear tokens:', error)
        }
    }

    /**
     * Get token expiration time
     */
    static getTokenExpiry(): number | null {
        try {
            const expiry = this.getSecureItem(this.TOKEN_EXPIRY_KEY)
            return expiry ? parseInt(expiry, 10) : null
        } catch (error) {
            console.error('Failed to get token expiry:', error)
            return null
        }
    }

    /**
     * Get time until token expires (in milliseconds)
     */
    static getTimeUntilExpiry(): number | null {
        try {
            const expiry = this.getTokenExpiry()
            if (!expiry) return null

            const now = Math.floor(Date.now() / 1000)
            return Math.max(0, (expiry - now) * 1000)
        } catch (error) {
            console.error('Failed to get time until expiry:', error)
            return null
        }
    }

    /**
     * Check if token is expired
     */
    private static isTokenExpired(token: string): boolean {
        try {
            const payload = this.decodeToken(token)
            if (!payload) return true

            const now = Math.floor(Date.now() / 1000)
            return payload.exp < now
        } catch (error) {
            console.error('Failed to check token expiration:', error)
            return true
        }
    }

    /**
     * Decode JWT token without verification (client-side only)
     */
    private static decodeToken(token: string): TokenPayload | null {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )

            return JSON.parse(jsonPayload)
        } catch (error) {
            console.error('Failed to decode token:', error)
            return null
        }
    }

    /**
     * Store item securely (localStorage with fallback to sessionStorage and cookies)
     */
    private static setSecureItem(key: string, value: string): void {
        try {
            // Try localStorage first
            localStorage.setItem(key, value)
            
            // Also store in cookies for middleware access
            this.setCookie(key, value)
        } catch (error) {
            try {
                // Fallback to sessionStorage
                sessionStorage.setItem(key, value)
                
                // Still try to set cookie
                this.setCookie(key, value)
            } catch (fallbackError) {
                console.error('Failed to store item in both storage types:', fallbackError)
                throw fallbackError
            }
        }
    }

    /**
     * Set cookie for middleware access
     */
    private static setCookie(key: string, value: string): void {
        try {
            // Map internal keys to cookie names
            const cookieName = key === this.ACCESS_TOKEN_KEY ? 'secret_safe_access_token' :
                              key === this.REFRESH_TOKEN_KEY ? 'secret_safe_refresh_token' :
                              key === this.TOKEN_EXPIRY_KEY ? 'secret_safe_token_expiry' :
                              key === this.TOKEN_ISSUED_KEY ? 'secret_safe_token_issued' :
                              key

            // Set cookie with appropriate settings
            document.cookie = `${cookieName}=${value}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        } catch (error) {
            console.warn('Failed to set cookie:', error)
        }
    }

    /**
     * Clear all cookies
     */
    private static clearCookies(): void {
        try {
            const cookieNames = [
                'secret_safe_access_token',
                'secret_safe_refresh_token', 
                'secret_safe_token_expiry',
                'secret_safe_token_issued'
            ]

            cookieNames.forEach(name => {
                document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
            })
        } catch (error) {
            console.warn('Failed to clear cookies:', error)
        }
    }

    /**
     * Retrieve item from secure storage
     */
    private static getSecureItem(key: string): string | null {
        try {
            // Try localStorage first
            return localStorage.getItem(key)
        } catch (error) {
            try {
                // Fallback to sessionStorage
                return sessionStorage.getItem(key)
            } catch (fallbackError) {
                console.error('Failed to retrieve item from both storage types:', fallbackError)
                return null
            }
        }
    }

    /**
     * Schedule automatic token cleanup
     */
    private static scheduleCleanup(expiryTimestamp: number): void {
        try {
            // Clear any existing cleanup
            this.clearScheduledCleanup()

            const now = Math.floor(Date.now() / 1000)
            const timeUntilCleanup = Math.max(0, (expiryTimestamp - now) * 1000) + this.CLEANUP_THRESHOLD

            // Schedule cleanup
            const timeoutId = setTimeout(() => {
                this.clearTokens()
            }, timeUntilCleanup)

            // Store timeout ID for cleanup
            sessionStorage.setItem('secret_safe_cleanup_timeout', timeoutId.toString())

        } catch (error) {
            console.error('Failed to schedule token cleanup:', error)
        }
    }

    /**
     * Clear scheduled cleanup timeout
     */
    private static clearScheduledCleanup(): void {
        try {
            const timeoutId = sessionStorage.getItem('secret_safe_cleanup_timeout')
            if (timeoutId) {
                clearTimeout(parseInt(timeoutId, 10))
                sessionStorage.removeItem('secret_safe_cleanup_timeout')
            }
        } catch (error) {
            console.error('Failed to clear scheduled cleanup:', error)
        }
    }

    /**
     * Validate token format (basic validation)
     */
    static isValidTokenFormat(token: string): boolean {
        try {
            if (!token || typeof token !== 'string') return false

            const parts = token.split('.')
            if (parts.length !== 3) return false

            // Check if parts are valid base64
            parts.forEach(part => {
                try {
                    atob(part.replace(/-/g, '+').replace(/_/g, '/'))
                } catch {
                    return false
                }
            })

            return true
        } catch (error) {
            return false
        }
    }

    /**
     * Get storage type currently being used
     */
    static getStorageType(): 'localStorage' | 'sessionStorage' | 'none' {
        try {
            const testKey = 'secret_safe_storage_test'
            const testValue = 'test'

            try {
                localStorage.setItem(testKey, testValue)
                localStorage.removeItem(testKey)
                return 'localStorage'
            } catch {
                try {
                    sessionStorage.setItem(testKey, testValue)
                    sessionStorage.removeItem(testKey)
                    return 'sessionStorage'
                } catch {
                    return 'none'
                }
            }
        } catch (error) {
            return 'none'
        }
    }
}
