import { useMediaQuery } from '@vueuse/core'

/**
 * Reactive viewport breakpoints matching Tailwind's defaults. Unlike reading
 * `window.innerWidth` once, these update when the window is resized.
 */
export function useBreakpoints() {
  // Below `sm`: phone layout (bottom navigation bar)
  const isMobile = useMediaQuery('(max-width: 639.98px)')
  // `xl` and up: enough room for the expanded navigation sidebar
  const isWide = useMediaQuery('(min-width: 1280px)')

  return { isMobile, isWide }
}
