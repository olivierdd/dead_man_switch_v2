/**
 * Authentication Forms Test Suite
 * Comprehensive testing for all authentication forms
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth/auth-context'
import LoginFormSimple from '@/components/auth/login-form-simple'
import { PasswordStrengthIndicator, PasswordRequirements } from '@/components/auth'

// Mock the auth context
const mockAuthContext = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
    clearError: jest.fn(),
    setError: jest.fn(),
    setLoading: jest.fn(),
    updateUser: jest.fn(),
    error: null,
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
    tokenHealth: 'excellent',
    timeUntilExpiry: 3600,
    sessionAge: 0,
    lastActivity: new Date(),
    isOnline: true,
    checkTokenExpiry: jest.fn(),
    refreshTokenIfNeeded: jest.fn(),
    updateLastActivity: jest.fn(),
    setOnlineStatus: jest.fn()
}

// Mock the auth store
jest.mock('@/lib/auth/auth-store', () => ({
    useAuthStore: () => mockAuthContext
}))

// Mock the auth API
jest.mock('@/lib/auth/auth-api', () => ({
    AuthAPI: {
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        getCurrentUser: jest.fn(),
        refreshToken: jest.fn(),
        forgotPassword: jest.fn(),
        resetPassword: jest.fn()
    }
}))

// Mock the auth hooks
jest.mock('@/lib/auth/auth-hooks', () => ({
    useAuthActions: () => ({
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshAuth: jest.fn(),
        clearError: jest.fn(),
        setError: jest.fn(),
        setLoading: jest.fn(),
        updateUser: jest.fn()
    }),
    useAuthState: () => ({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null
    })
}))

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    })

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    )
}

describe('Authentication Forms', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('LoginFormSimple', () => {
        it('renders login form correctly', () => {
            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
        })

        it('shows validation errors for empty fields', async () => {
            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            const submitButton = screen.getByRole('button', { name: /sign in/i })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/username or email is required/i)).toBeInTheDocument()
                expect(screen.getByText(/password is required/i)).toBeInTheDocument()
            })
        })

        it('shows validation error for short password', async () => {
            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            const usernameInput = screen.getByLabelText(/username/i)
            const passwordInput = screen.getByLabelText(/password/i)
            const submitButton = screen.getByRole('button', { name: /sign in/i })

            fireEvent.change(usernameInput, { target: { value: 'testuser' } })
            fireEvent.change(passwordInput, { target: { value: '123' } })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
            })
        })

        it('submits form with valid data', async () => {
            const mockLogin = jest.fn()
            mockAuthContext.login = mockLogin

            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            const usernameInput = screen.getByLabelText(/username/i)
            const passwordInput = screen.getByLabelText(/password/i)
            const submitButton = screen.getByRole('button', { name: /sign in/i })

            fireEvent.change(usernameInput, { target: { value: 'testuser' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    username: 'testuser',
                    password: 'password123'
                })
            })
        })
    })

    describe('PasswordStrengthIndicator', () => {
        it('renders password strength indicator', () => {
            render(<PasswordStrengthIndicator password="test123" />)
            expect(screen.getByText(/password strength/i)).toBeInTheDocument()
        })

        it('shows weak password indicator', () => {
            render(<PasswordStrengthIndicator password="123" />)
            expect(screen.getByText(/weak/i)).toBeInTheDocument()
        })

        it('shows strong password indicator', () => {
            render(<PasswordStrengthIndicator password="StrongPass123!" />)
            expect(screen.getByText(/strong/i)).toBeInTheDocument()
        })

        it('shows password score', () => {
            render(<PasswordStrengthIndicator password="test123" showScore={true} />)
            expect(screen.getByText(/\d+\/100/i)).toBeInTheDocument()
        })

        it('shows password suggestions', () => {
            render(<PasswordStrengthIndicator password="weak" showSuggestions={true} />)
            expect(screen.getByText(/add numbers/i)).toBeInTheDocument()
        })
    })

    describe('PasswordRequirements', () => {
        it('renders all password requirements', () => {
            render(<PasswordRequirements />)

            expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
            expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument()
            expect(screen.getByText(/lowercase letter/i)).toBeInTheDocument()
            expect(screen.getByText(/number/i)).toBeInTheDocument()
            expect(screen.getByText(/special character/i)).toBeInTheDocument()
        })

        it('shows requirement status with icons', () => {
            render(<PasswordRequirements showIcons={true} />)

            // Check that icons are present
            const icons = screen.getAllByTestId('requirement-icon')
            expect(icons.length).toBeGreaterThan(0)
        })
    })

    describe('Form Validation Integration', () => {
        it('validates required fields', async () => {
            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            const submitButton = screen.getByRole('button', { name: /sign in/i })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/username or email is required/i)).toBeInTheDocument()
            })
        })

        it('clears validation errors on input', async () => {
            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            const usernameInput = screen.getByLabelText(/username/i)
            const submitButton = screen.getByRole('button', { name: /sign in/i })

            // Submit with empty field to show error
            fireEvent.click(submitButton)
            await waitFor(() => {
                expect(screen.getByText(/username or email is required/i)).toBeInTheDocument()
            })

            // Type in the field to clear error
            fireEvent.change(usernameInput, { target: { value: 'testuser' } })
            await waitFor(() => {
                expect(screen.queryByText(/username or email is required/i)).not.toBeInTheDocument()
            })
        })
    })

    describe('Form Error Handling', () => {
        it('handles API errors gracefully', async () => {
            const mockError = new Error('Invalid credentials')
            mockAuthContext.login = jest.fn().mockRejectedValue(mockError)

            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            const usernameInput = screen.getByLabelText(/username/i)
            const passwordInput = screen.getByLabelText(/password/i)
            const submitButton = screen.getByRole('button', { name: /sign in/i })

            fireEvent.change(usernameInput, { target: { value: 'testuser' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockAuthContext.login).toHaveBeenCalled()
            })
        })

        it('shows loading state during submission', async () => {
            let resolvePromise: (value: any) => void
            const mockPromise = new Promise((resolve) => {
                resolvePromise = resolve
            })
            mockAuthContext.login = jest.fn().mockReturnValue(mockPromise)

            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            const usernameInput = screen.getByLabelText(/username/i)
            const passwordInput = screen.getByLabelText(/password/i)
            const submitButton = screen.getByRole('button', { name: /sign in/i })

            fireEvent.change(usernameInput, { target: { value: 'testuser' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })
            fireEvent.click(submitButton)

            // Check loading state
            expect(submitButton).toBeDisabled()
            expect(submitButton).toHaveTextContent(/signing in/i)

            // Resolve the promise
            resolvePromise!({})
            await waitFor(() => {
                expect(submitButton).not.toBeDisabled()
            })
        })
    })

    describe('Form Accessibility', () => {
        it('has proper form labels', () => {
            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        })

        it('has proper button roles', () => {
            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
        })

        it('shows validation errors to screen readers', async () => {
            render(
                <TestWrapper>
                    <LoginFormSimple />
                </TestWrapper>
            )

            const submitButton = screen.getByRole('button', { name: /sign in/i })
            fireEvent.click(submitButton)

            await waitFor(() => {
                const errorMessage = screen.getByText(/username or email is required/i)
                expect(errorMessage).toHaveAttribute('role', 'alert')
            })
        })
    })
})
