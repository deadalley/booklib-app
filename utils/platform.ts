import { Capacitor } from '@capacitor/core'

export type AppPlatform = 'electron' | 'android' | 'web'

/**
 * Where the app is running:
 * - `electron`: the Windows/Linux desktop app (`window.electronAPI` is exposed
 *   by the preload script)
 * - `android`: the Capacitor Android app
 * - `web`: the browser demo, which keeps data in localStorage
 */
export function getAppPlatform(): AppPlatform {
  if (typeof window === 'undefined') return 'web'
  if ('electronAPI' in window) return 'electron'
  if (Capacitor.isNativePlatform()) return 'android'
  return 'web'
}

/** True only for the browser demo, not the installable apps. */
export function isWebDemo(): boolean {
  return getAppPlatform() === 'web'
}

/** Custom cover uploads need the desktop app's file storage. */
export function supportsCoverUploads(): boolean {
  return getAppPlatform() === 'electron'
}

export const RELEASES_URL =
  'https://github.com/deadalley/booklib-app/releases/latest'
