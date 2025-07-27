/**
 * Get the correct asset path for the current environment
 * In Electron, we need relative paths, in web we use absolute paths
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Check if we're running in Electron (file:// protocol)
  if (import.meta.client && window.location.protocol === 'file:') {
    return `./${cleanPath}`
  }

  // Default to absolute path for web
  return `/${cleanPath}`
}
