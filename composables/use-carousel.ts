import type { MaybeRefOrGetter } from 'vue'

/**
 * Index and autoplay for a rotating set of slides. Autoplay pauses while the
 * pointer is over it, while focus is inside it, when paused by the user (or
 * after they pick a slide with `hold`) and under prefers-reduced-motion.
 */
export function useCarousel(
  count: MaybeRefOrGetter<number>,
  intervalMs: number,
) {
  const index = ref(0)
  const hovered = ref(false)
  const focused = ref(false)
  const paused = ref(false)

  function go(step: number) {
    const n = toValue(count)
    if (n) index.value = (index.value + step + n) % n
  }

  function pick(next: number, { hold = false } = {}) {
    index.value = next
    if (hold) paused.value = true
  }

  function onFocusOut(event: FocusEvent) {
    const root = event.currentTarget as HTMLElement
    if (!root.contains(event.relatedTarget as Node | null)) {
      focused.value = false
    }
  }

  // Removing slides can leave the index past the end
  watch(
    () => toValue(count),
    (n) => {
      if (n && index.value >= n) index.value = n - 1
    },
  )

  onMounted(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      paused.value = true
    }
  })

  watchEffect((onCleanup) => {
    if (hovered.value || focused.value || paused.value) return
    if (toValue(count) < 2) return
    const timer = setInterval(() => go(1), intervalMs)
    onCleanup(() => clearInterval(timer))
  })

  /** Spread onto the carousel's root element. */
  const listeners = {
    mouseenter: () => (hovered.value = true),
    mouseleave: () => (hovered.value = false),
    focusin: () => (focused.value = true),
    focusout: onFocusOut,
  }

  return { index, paused, go, pick, listeners }
}
