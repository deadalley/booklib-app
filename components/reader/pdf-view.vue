<template>
  <div ref="viewport" class="pdf-viewport" data-testid="pdf-view">
    <div
      ref="pageEl"
      class="pdf-page"
      :style="{
        '--scale-factor': scale,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }"
    >
      <canvas ref="canvas" class="block size-full" />
      <div ref="textLayer" class="textLayer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

/**
 * One PDF page at a time, scaled to fit, with a text layer so passages can
 * be selected and highlighted.
 */
const props = defineProps<{
  data: Uint8Array
  // "page:<n>" to start on
  location: string | null
}>()

const emit = defineEmits<{
  (e: 'ready', info: { pages: number }): void
  (
    e: 'relocated',
    position: {
      location: string
      progress: number
      page: number
      label: string
    },
  ): void
  (e: 'selected', selection: { location: string; text: string } | null): void
}>()

const viewport = ref<HTMLElement>()
const pageEl = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const textLayer = ref<HTMLElement>()
const page = ref(1)
const pages = ref(0)
const scale = ref(1)
const size = reactive({ width: 0, height: 0 })

let pdf: PDFDocumentProxy | null = null
let renderTask: RenderTask | null = null
let resizeObserver: ResizeObserver | null = null

async function loadPdf() {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerUrl } =
    await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  // pdf.js takes ownership of the buffer, so hand it a copy
  pdf = await pdfjs.getDocument({ data: props.data.slice() }).promise
  pages.value = pdf.numPages
  emit('ready', { pages: pdf.numPages })
  const start = Number(props.location?.match(/^page:(\d+)$/)?.[1] ?? 1)
  await show(Math.min(Math.max(1, start), pdf.numPages))
}

async function show(number: number) {
  if (!pdf || !canvas.value || !textLayer.value || !viewport.value) return
  page.value = number
  const pdfjs = await import('pdfjs-dist')
  const pdfPage = await pdf.getPage(number)
  const natural = pdfPage.getViewport({ scale: 1 })
  // Fit the page inside the reading area
  const bounds = viewport.value.getBoundingClientRect()
  scale.value = Math.max(
    0.1,
    Math.min(
      (bounds.width - 32) / natural.width,
      (bounds.height - 32) / natural.height,
    ),
  )
  const view = pdfPage.getViewport({ scale: scale.value })
  size.width = view.width
  size.height = view.height

  const ratio = window.devicePixelRatio || 1
  canvas.value.width = Math.floor(view.width * ratio)
  canvas.value.height = Math.floor(view.height * ratio)
  renderTask?.cancel()
  renderTask = pdfPage.render({
    canvasContext: canvas.value.getContext('2d')!,
    viewport: view,
    transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
  })
  try {
    await renderTask.promise
  } catch {
    // Cancelled by a newer page
    return
  }

  textLayer.value.replaceChildren()
  await new pdfjs.TextLayer({
    textContentSource: pdfPage.streamTextContent(),
    container: textLayer.value,
    viewport: view,
  }).render()

  emit('relocated', {
    location: `page:${number}`,
    progress: number / pages.value,
    page: number,
    label: `Page ${number} of ${pages.value}`,
  })
  emit('selected', null)
}

function onSelectionChange() {
  const selection = document.getSelection()
  const text = selection?.toString().trim() ?? ''
  const inPage =
    !!selection?.anchorNode && !!textLayer.value?.contains(selection.anchorNode)
  emit(
    'selected',
    text && inPage ? { location: `page:${page.value}`, text } : null,
  )
}

defineExpose({
  next: () => page.value < pages.value && show(page.value + 1),
  prev: () => page.value > 1 && show(page.value - 1),
  goTo: (location: string) => {
    const number = Number(location.match(/^page:(\d+)$/)?.[1])
    if (number) show(number)
  },
  clearSelection: () => document.getSelection()?.removeAllRanges(),
})

onMounted(async () => {
  document.addEventListener('selectionchange', onSelectionChange)
  await loadPdf()
  resizeObserver = new ResizeObserver(() => show(page.value))
  if (viewport.value) resizeObserver.observe(viewport.value)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
  resizeObserver?.disconnect()
  renderTask?.cancel()
  pdf?.destroy()
})
</script>

<style scoped>
@reference '../../assets/css/main.css';

.pdf-viewport {
  @apply grid size-full place-items-center overflow-auto;
}
.pdf-page {
  @apply relative bg-white shadow-[0_8px_24px_rgba(27,28,28,0.18)];
}
/* pdf.js's text layer: invisible text over the canvas, for selecting */
.pdf-page :deep(.textLayer) {
  position: absolute;
  inset: 0;
  overflow: clip;
  line-height: 1;
  text-size-adjust: none;
  forced-color-adjust: none;
  transform-origin: 0 0;
  z-index: 0;
}
.pdf-page :deep(.textLayer :is(span, br)) {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}
.pdf-page :deep(.textLayer ::selection) {
  background: color-mix(in srgb, var(--primary) 30%, transparent);
}
.pdf-page :deep(.textLayer .endOfContent) {
  display: block;
  position: absolute;
  inset: 100% 0 0;
  z-index: 0;
  cursor: default;
  user-select: none;
}
</style>
