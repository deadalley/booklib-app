export function isMobile(): boolean {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 640
  }
  return false
}
