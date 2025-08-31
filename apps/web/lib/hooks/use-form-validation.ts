/**
 * Form Validation Hook
 * Integrates react-hook-form with zod validation for seamless form handling
 */

import { useForm, UseFormProps, FieldValues, Path, FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'

export interface UseFormValidationOptions<T extends FieldValues> {
    schema: z.ZodSchema<T>
    mode?: 'onBlur' | 'onChange' | 'onSubmit'
    reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit'
    defaultValues?: Partial<T>
    shouldFocusError?: boolean
    shouldUnregister?: boolean
    shouldUseNativeValidation?: boolean
}

export interface ValidationResult<T extends FieldValues> {
    form: any
    isValid: boolean
    errors: any
    hasErrors: boolean
    getFieldError: (field: Path<T>) => any
    getFieldErrorMessage: (field: Path<T>) => string | undefined
    isFieldValid: (field: Path<T>) => boolean
    clearFieldError: (field: Path<T>) => void
    clearAllErrors: () => void
    validateField: (field: Path<T>) => Promise<boolean>
    validateForm: () => Promise<boolean>
}

export function useFormValidation<T extends FieldValues>({
    schema,
    mode = 'onBlur',
    reValidateMode = 'onChange',
    defaultValues,
    shouldFocusError = true,
    shouldUnregister = false,
    shouldUseNativeValidation = false,
    ...formOptions
}: UseFormValidationOptions<T>): ValidationResult<T> {

    const form = useForm<T>({
        resolver: zodResolver(schema),
        mode,
        reValidateMode,
        defaultValues: defaultValues as any,
        shouldFocusError,
        shouldUnregister,
        shouldUseNativeValidation,
        ...formOptions
    })

    const { formState, clearErrors, trigger, getFieldState } = form
    const { errors, isValid, isDirty, isSubmitting } = formState

    // Memoized error state
    const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

    // Get field error
    const getFieldError = useCallback((field: Path<T>): any => {
        return errors[field]
    }, [errors])

    // Get field error message
    const getFieldErrorMessage = useCallback((field: Path<T>): string | undefined => {
        const error = errors[field]
        return (error as any)?.message || undefined
    }, [errors])

    // Check if field is valid
    const isFieldValid = useCallback((field: Path<T>): boolean => {
        const fieldState = getFieldState(field)
        return !fieldState.error && fieldState.isDirty
    }, [getFieldState])

    // Clear specific field error
    const clearFieldError = useCallback((field: Path<T>) => {
        clearErrors(field)
    }, [clearErrors])

    // Clear all errors
    const clearAllErrors = useCallback(() => {
        clearErrors()
    }, [clearErrors])

    // Validate specific field
    const validateField = useCallback(async (field: Path<T>): Promise<boolean> => {
        try {
            const result = await trigger(field)
            return result
        } catch (error) {
            console.error('Field validation error:', error)
            return false
        }
    }, [trigger])

    // Validate entire form
    const validateForm = useCallback(async (): Promise<boolean> => {
        try {
            const result = await trigger()
            return result
        } catch (error) {
            console.error('Form validation error:', error)
            return false
        }
    }, [trigger])

    return {
        form,
        isValid,
        errors,
        hasErrors,
        getFieldError,
        getFieldErrorMessage,
        isFieldValid,
        clearFieldError,
        clearAllErrors,
        validateField,
        validateForm
    }
}

/**
 * Hook for individual field validation state
 */
export function useFieldValidation<T extends FieldValues>(form: any, field: Path<T>) {
    const { formState, getFieldState } = form
    const { errors, isDirty, isSubmitting } = formState

    const fieldState = getFieldState(field)
    const error = errors[field]

    return {
        error,
        isDirty: fieldState.isDirty,
        isTouched: fieldState.isTouched,
        isValid: !error && fieldState.isDirty,
        isSubmitting
    }
}

/**
 * Hook for form submission handling
 */
export function useFormSubmission<T extends FieldValues>(
    form: any,
    onSubmit: (data: T) => Promise<void> | void,
    onError?: (error: any) => void
) {
    const { handleSubmit, formState, reset, setError } = form
    const { isSubmitting, isDirty, isValid } = formState

    const submitHandler = useCallback(async (data: T) => {
        try {
            await onSubmit(data)
        } catch (error: any) {
            if (error?.field && error?.message) {
                setError(error.field as Path<T>, {
                    type: 'manual',
                    message: error.message
                })
            }
            onError?.(error)
        }
    }, [onSubmit, setError, onError])

    const submit = handleSubmit(submitHandler)

    return {
        submit,
        isSubmitting,
        isDirty,
        isValid,
        reset
    }
}

/**
 * Hook for real-time field validation
 */
export function useRealTimeValidation<T extends FieldValues>(
    form: any,
    field: Path<T>,
    delay: number = 500
) {
    const { watch, trigger, getFieldState } = form
    const fieldValue = watch(field)
    const fieldState = getFieldState(field)

    // Debounced validation
    const validateWithDelay = useCallback(async () => {
        if (fieldValue && fieldValue.length > 0) {
            try {
                await trigger(field)
            } catch (error) {
                console.error('Real-time validation error:', error)
            }
        }
    }, [fieldValue, trigger, field])

    // Use effect for debounced validation
    React.useEffect(() => {
        const timer = setTimeout(validateWithDelay, delay)
        return () => clearTimeout(timer)
    }, [validateWithDelay, delay])

    return {
        value: fieldValue,
        error: fieldState.error,
        isDirty: fieldState.isDirty,
        isValid: !fieldState.error && fieldState.isDirty
    }
}

/**
 * Hook for form error summary
 */
export function useFormErrorSummary<T extends FieldValues>(form: any) {
    const { formState } = form
    const { errors } = formState

    const errorSummary = useMemo(() => {
        const errorEntries = Object.entries(errors)
        const fieldErrors = errorEntries.filter(([key]) => key !== 'root')
        const rootError = errors.root

        return {
            totalErrors: errorEntries.length,
            fieldErrors: fieldErrors.length,
            rootError: rootError?.message,
            hasErrors: errorEntries.length > 0,
            errorList: fieldErrors.map(([key, error]) => ({
                field: key,
                message: (error as any)?.message || 'Unknown error'
            }))
        }
    }, [errors])

    return errorSummary
}

// Re-export React for the useEffect hook
import React from 'react'
