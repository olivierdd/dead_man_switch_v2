import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { TokenManager } from './token-manager'

// Types for API requests and responses
export interface LoginRequest {
    username: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    first_name?: string
    last_name?: string
    display_name?: string
    role?: 'admin' | 'writer' | 'reader'
    timezone?: string
    language?: string
}

export interface LoginResponse {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    user: {
        id: string
        email: string
        display_name: string
        role: string
        is_verified: boolean
    }
}

export interface RegisterResponse {
    id: string
    email: string
    display_name: string
    role: string
    is_active: boolean
    created_at: string
    last_check_in?: string
    subscription_tier: string
    avatar_url?: string
    bio?: string
}

export interface PasswordResetRequest {
    email: string
}

export interface PasswordResetConfirmRequest {
    token: string
    new_password: string
}

export interface UserProfile {
    id: string
    email: string
    display_name: string
    role: string
    is_active: boolean
    created_at: string
    last_check_in?: string
    subscription_tier: string
    avatar_url?: string
    bio?: string
}

class AuthAPI {
    private api: AxiosInstance

    constructor() {
        // Use current domain for API calls in production, localhost for development
        const baseURL = process.env.NODE_ENV === 'production'
            ? (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')
            : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')

        this.api = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = this.getStoredToken()
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => {
                return Promise.reject(error)
            }
        )

        // Response interceptor to handle token refresh
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true

                    try {
                        // Attempt to refresh token
                        const newToken = await this.refreshToken()
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`
                            return this.api(originalRequest)
                        }
                    } catch (refreshError) {
                        // Refresh failed, redirect to login
                        this.clearStoredToken()
                        window.location.href = '/auth/login'
                    }
                }

                return Promise.reject(error)
            }
        )
    }

    // Token management
    private getStoredToken(): string | null {
        return TokenManager.getAccessToken()
    }

    private setStoredToken(token: string): void {
        // This method is now handled by TokenManager.storeTokens()
        // Keeping for backward compatibility but it's deprecated
        console.warn('setStoredToken is deprecated. Use TokenManager.storeTokens() instead.')
    }

    private clearStoredToken(): void {
        TokenManager.clearTokens()
    }

    // Authentication methods
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const formData = new FormData()
        formData.append('username', credentials.username)
        formData.append('password', credentials.password)

        const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        // Store tokens securely using TokenManager
        if (response.data.access_token) {
            // Use empty string for refresh token if not provided
            const refreshToken = response.data.refresh_token || ''
            TokenManager.storeTokens(response.data.access_token, refreshToken)
        }

        return response.data
    }

    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        const response: AxiosResponse<RegisterResponse> = await this.api.post('/auth/register', userData)
        return response.data
    }

    async logout(): Promise<void> {
        try {
            await this.api.post('/auth/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            this.clearStoredToken()
        }
    }

    async getCurrentUser(): Promise<UserProfile> {
        const response: AxiosResponse<UserProfile> = await this.api.get('/auth/me')
        return response.data
    }

    async refreshToken(): Promise<{ access_token: string }> {
        const refreshToken = TokenManager.getRefreshToken()
        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        const response: AxiosResponse<{ access_token: string }> = await this.api.post('/auth/refresh', {
            refresh_token: refreshToken
        })

        // Update stored access token
        if (response.data.access_token) {
            const currentRefreshToken = TokenManager.getRefreshToken()
            if (currentRefreshToken) {
                TokenManager.storeTokens(response.data.access_token, currentRefreshToken)
            }
        }

        return response.data
    }



    async forgotPassword(email: string): Promise<{ message: string }> {
        const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/forgot-password', { email })
        return response.data
    }

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/reset-password', {
            token,
            new_password: newPassword,
        })
        return response.data
    }

    async verifyEmail(token: string): Promise<{ success: boolean; message: string; user?: any }> {
        try {
            const response: AxiosResponse<{ success: boolean; message: string; user?: any }> = await this.api.post('/verification/verify-email', {
                token
            })
            return response.data
        } catch (error: any) {
            if (error.response?.data) {
                return {
                    success: false,
                    message: error.response.data.detail || 'Verification failed'
                }
            }
            return {
                success: false,
                message: 'Verification failed. Please try again.'
            }
        }
    }

    async resendVerification(): Promise<{ success: boolean; message: string }> {
        try {
            const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.post('/verification/resend-verification')
            return response.data
        } catch (error: any) {
            if (error.response?.data) {
                return {
                    success: false,
                    message: error.response.data.detail || 'Failed to resend verification'
                }
            }
            return {
                success: false,
                message: 'Failed to resend verification. Please try again.'
            }
        }
    }

    // Utility methods
    isTokenExpired(): boolean {
        return TokenManager.shouldRefreshToken()
    }

    getTokenPayload(): any {
        const token = this.getStoredToken()
        if (!token) return null
        return TokenManager.getTokenPayload(token)
    }
}

// Lazy initialization to avoid SSR issues
let authAPIInstance: AuthAPI | null = null

export const authAPI = {
    get instance() {
        if (!authAPIInstance) {
            authAPIInstance = new AuthAPI()
        }
        return authAPIInstance
    },

    // Proxy all methods to the instance
    login: (credentials: LoginRequest) => authAPI.instance.login(credentials),
    register: (userData: RegisterRequest) => authAPI.instance.register(userData),
    logout: () => authAPI.instance.logout(),
    getCurrentUser: () => authAPI.instance.getCurrentUser(),
    refreshToken: () => authAPI.instance.refreshToken(),
    forgotPassword: (email: string) => authAPI.instance.forgotPassword(email),
    resetPassword: (token: string, newPassword: string) => authAPI.instance.resetPassword(token, newPassword),
    verifyEmail: (token: string) => authAPI.instance.verifyEmail(token),
    resendVerification: () => authAPI.instance.resendVerification(),
    isTokenExpired: () => authAPI.instance.isTokenExpired(),
    getTokenPayload: () => authAPI.instance.getTokenPayload()
}
