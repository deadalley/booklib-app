/**
 * Environment variable validation utilities
 * Provides runtime validation for required environment variables
 */

/**
 * Validates that a required environment variable is set
 * Throws an error if the variable is missing
 */
export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

/**
 * Gets an environment variable with a default value
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

/**
 * Validates that a required environment variable is set (for runtime config)
 * Returns the value or throws an error
 */
export function requireRuntimeConfig<T>(value: T | undefined, key: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Required runtime config ${key} is not set`)
  }
  return value
}
