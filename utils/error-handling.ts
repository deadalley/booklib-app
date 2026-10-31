/**
 * Centralized error handling utilities
 * Provides consistent error formatting, logging, and error creation patterns
 */

/**
 * Extracts a readable error message from an unknown error value
 */
function getErrorMessage(error: unknown): string {
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
function createContextualError(
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
