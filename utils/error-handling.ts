/**
 * Centralized error handling utilities
 * Provides consistent error formatting, logging, and error creation patterns
 */

/**
 * Extracts a readable error message from an unknown error value
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return String(error)
}

/**
 * Creates a contextual error message with operation and context details
 */
export function createContextualError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>,
): Error {
  const errorMessage = getErrorMessage(error)
  const contextStr = context
    ? ` (${Object.entries(context)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')})`
    : ''
  return new Error(`${operation}${contextStr}: ${errorMessage}`)
}

/**
 * Wraps an async function with consistent error handling
 * Logs errors and optionally re-throws with contextual information
 */
export async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
  options?: {
    context?: Record<string, unknown>
    logError?: boolean
    rethrow?: boolean
  },
): Promise<T> {
  const { context, logError = true, rethrow = true } = options || {}
  try {
    return await fn()
  } catch (error) {
    if (logError) {
      console.error(`${operation} error:`, error)
    }
    if (rethrow) {
      throw createContextualError(operation, error, context)
    }
    throw error
  }
}

/**
 * Handles file operation errors with consistent formatting
 */
export function handleFileError(
  operation: 'read' | 'write' | 'create' | 'delete' | 'ensure',
  filePath: string,
  error: unknown,
): Error {
  const operationMap: Record<string, string> = {
    read: 'Failed to read file',
    write: 'Failed to write file',
    create: 'Failed to create file',
    delete: 'Failed to delete file',
    ensure: 'Failed to ensure directory',
  }
  const operationMessage = operationMap[operation] || 'File operation failed'
  return createContextualError(operationMessage, error, {
    filePath,
  })
}

/**
 * Handles database operation errors with consistent formatting
 */
export function handleDatabaseError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>,
): Error {
  return createContextualError(`Database ${operation} failed`, error, context)
}

/**
 * Safely executes a function and returns the result or null on error
 * Useful for operations where errors should be silently handled
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  onError?: (error: unknown) => void,
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    if (onError) {
      onError(error)
    }
    return null
  }
}

/**
 * Validates that an error is an instance of Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}
