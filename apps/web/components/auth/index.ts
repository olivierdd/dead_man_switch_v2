// Authentication components
// export { LoginForm } from './login-form' // Temporarily disabled due to validation hook issues
export { RegistrationForm } from './registration-form'

// Route protection components
export {
    ProtectedRoute,
    withProtectedRoute,
    AdminRoute,
    WriterRoute,
    ReaderRoute,
    RoleBasedRoute,
    ProtectedRouteWithCustomLoading
} from './protected-route'

// Authentication status indicators
export { AuthStatusIndicator } from './auth-status-indicator'
export { SessionTimer } from './session-timer'
export { UserActivityIndicator } from './user-activity-indicator'
export { PasswordStrengthIndicator, PasswordRequirements, PasswordMatchIndicator } from './password-strength-indicator'
export { default as LoginFormSimple } from './login-form-simple'

// Verification components
export { default as VerificationStatusIndicator } from './verification-status-indicator'
export { default as VerificationReminderNotification } from './verification-reminder-notification'
// export { default as LoginForm } from './login-form' // Temporarily disabled due to validation hook issues
