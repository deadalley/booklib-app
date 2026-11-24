<template>
  <div ref="container" class="epub-view" data-testid="epub-view" />
</template>

<script setup lang="ts">
import type { Book as EpubBook, Rendition } from 'epubjs'

export type TocItem = { label: string; href: string; depth: number }

/**
 * An EPUB, paginated like a book. Positions are EPUB CFIs; progress comes
 * from locations generated once the book opens.
 */
const props = defineProps<{
  data: Uint8Array
  // A CFI to start at
  location: string | null
  // Percent, e.g. 100
  fontSize: number
  // Saved highlights to draw: their CFI ranges
  highlights: string[]
}>()

const emit = defineEmits<{
  (e: 'ready', info: { toc: TocItem[] }): void
  (
    e: 'relocated',
    position: { location: string; progress: number; label: string },
  ): void
  (e: 'selected', selection: { location: string; text: string } | null): void
}>()

const container = ref<HTMLElement>()
let book: EpubBook | null = null
let rendition: Rendition | null = null
const drawn = new Set<string>()

/** The app's colors and font, so the book matches the theme */
function applyTheme() {
  if (!rendition) return
  const style = getComputedStyle(document.documentElement)
  const color = (name: string) => style.getPropertyValue(name).trim()
  rendition.themes.default({
    body: {
      color: `${color('--ink-primary')} !important`,
      background: 'transparent !important',
      'font-family': 'Newsreader, Georgia, serif !important',
      'line-height': '1.6 !important',
    },
    a: { color: `${color('--primary')} !important` },
    '::selection': {
      background: `color-mix(in srgb, ${color('--primary')} 30%, transparent)`,
    },
  })
  rendition.themes.fontSize(`${props.fontSize}%`)
}

function drawHighlights() {
  if (!rendition) return
  const style = getComputedStyle(document.documentElement)
  for (const cfi of props.highlights) {
    if (drawn.has(cfi)) continue
    drawn.add(cfi)
    rendition.annotations.highlight(cfi, {}, () => {}, 'bl-highlight', {
      fill: style.getPropertyValue('--secondary-400').trim() || '#e9b56c',
      'fill-opacity': '0.4',
      'mix-blend-mode': 'multiply',
    })
  }
}

function flattenToc(
  items: { label: string; href: string; subitems?: unknown[] }[],
  depth = 0,
): TocItem[] {
  return items.flatMap((item) => [
    { label: item.label.trim(), href: item.href, depth },
    ...flattenToc(
      (item.subitems ?? []) as { label: string; href: string }[],
      depth + 1,
    ),
  ])
}

onMounted(async () => {
  if (!container.value) return
  const { default: ePub } = await import('epubjs')
  // epub.js keeps the buffer, so hand it a copy
  book = ePub(props.data.slice().buffer as ArrayBuffer)
  rendition = book.renderTo(container.value, {
    width: '100%',
    height: '100%',
    flow: 'paginated',
    spread: 'auto',
    allowScriptedContent: false,
  })
  applyTheme()

  rendition.on(
    'relocated',
    (location: {
      start: {
        cfi: string
        percentage?: number
        displayed?: { page: number; total: number }
      }
    }) => {
      const cfi = location.start.cfi
      const progress = book?.locations.length()
        ? book.locations.percentageFromCfi(cfi)
        : (location.start.percentage ?? 0)
      emit('relocated', {
        location: cfi,
        progress,
        label: `${Math.round(progress * 100)}%`,
      })
      emit('selected', null)
    },
  )

  rendition.on('selected', (cfiRange: string) => {
    const text = rendition?.getRange(cfiRange)?.toString().trim() ?? ''
    emit('selected', text ? { location: cfiRange, text } : null)
  })

  // Arrow keys work while the book's frame has focus too
  rendition.on('keyup', (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') rendition?.next()
    if (event.key === 'ArrowLeft') rendition?.prev()
  })

  await rendition.display(props.location ?? undefined)
  drawHighlights()

  const navigation = await book.loaded.navigation
  emit('ready', {
    toc: flattenToc(
      navigation.toc as { label: string; href: string; subitems?: unknown[] }[],
    ),
  })

  // Progress needs locations; generating them takes a moment on long books
  await book.locations.generate(1600)
  const current = rendition.currentLocation() as unknown as {
    start?: { cfi: string }
  }
  if (current?.start?.cfi) {
    const progress = book.locations.percentageFromCfi(current.start.cfi)
    emit('relocated', {
      location: current.start.cfi,
      progress,
      label: `${Math.round(progress * 100)}%`,
    })
  }
})

watch(() => props.fontSize, applyTheme)
watch(() => props.highlights, drawHighlights, { deep: true })

defineExpose({
  next: () => rendition?.next(),
  prev: () => rendition?.prev(),
  goTo: (target: string) => rendition?.display(target),
  clearSelection: () => {
    const contents = rendition?.getContents() as unknown as {
      window: Window
    }[]
    contents?.forEach(({ window: frame }) =>
      frame.getSelection()?.removeAllRanges(),
    )
  },
})

onBeforeUnmount(() => {
  rendition?.destroy()
  book?.destroy()
})
</script>

<style scoped>
@reference '../../assets/css/main.css';

.epub-view {
  @apply size-full;
}
</style>
