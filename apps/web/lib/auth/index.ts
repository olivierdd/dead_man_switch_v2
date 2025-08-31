// Authentication store and context
export { useAuthStore, useAuth, useAuthActions } from './auth-store'
export { AuthProvider, useAuthContext, withAuth } from './auth-context'

// Authentication hooks
export {
    useAuthActions as useAuthActionsHook,
    useAuthState,
    useUser,
    useIsAuthenticated,
    useAuthLoading,
    useAuthError,
    useHasRole,
    useIsVerified,
    useIsAdmin,
    useIsWriter,
    useIsReader,
} from './auth-hooks'

// Authentication API
export { authAPI } from './auth-api'

// Token management
export { TokenManager } from './token-manager'
export { TokenRefreshService, useTokenRefresh } from './token-refresh'

// Authentication persistence
export { AuthPersistenceService } from './auth-persistence'
export { useAuthPersistence } from './use-auth-persistence'

// Route protection and permissions
export { RouteGuard } from './route-guard'
export { usePermissions, useFeaturePermission, useRouteAccess, useRoleCondition, useAdminOnly, useWriterOrHigher, useReaderOrHigher } from './use-permissions'

// Types from auth-store
export type { User, AuthState } from './auth-store'

// Types from auth-api
export type {
    LoginRequest,
    RegisterRequest,
    LoginResponse,
    RegisterResponse,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    UserProfile,
} from './auth-api'
