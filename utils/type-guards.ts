/**
 * Type guard utilities for runtime type checking
 * Provides safe type narrowing without type assertions
 */

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Type guard to check if a value is an object (and not null)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * Type guard to check if a value is not null or undefined
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Type guard to check if a value has a specific property
 */
export function hasProperty<K extends string>(
  value: unknown,
  key: K,
): value is Record<K, unknown> {
  return isObject(value) && key in value
}

/**
 * Type guard to check if an object has a property of a specific type
 */
export function hasPropertyOfType<K extends string, T>(
  value: unknown,
  key: K,
  typeGuard: (val: unknown) => val is T,
): value is Record<K, T> {
  return hasProperty(value, key) && typeGuard(value[key])
}

/**
 * Type guard to check if a parsed JSON result has a books array
 */
export function isBookImportResult(
  value: unknown,
): value is { books: unknown[] } {
  return (
    isObject(value) &&
    hasProperty(value, 'books') &&
    isArray(value.books)
  )
}

/**
 * Type guard to check if FileReader result is a string
 */
export function isFileReaderStringResult(
  value: unknown,
): value is string {
  return isString(value)
}
