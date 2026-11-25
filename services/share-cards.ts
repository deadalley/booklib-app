import type { Book, BookNote } from '~/types/book'
import dayjs from 'dayjs'
import { getBookFinishedAt } from '~/utils/book-progress'
import { activeTheme, darkTheme } from '~/utils/theme'

/*
 * Shareable images: a book, a highlighted quote, or a year in books, drawn
 * on a canvas in BookLib's colours and fonts. Covers are fetched and drawn
 * as bitmaps, so a canvas with a desktop cover can still be exported; a
 * cover that can't be fetched becomes a drawn placeholder.
 */

export type CardTheme = 'light' | 'dark'

export const CARD_WIDTH = 1080
export const CARD_HEIGHT = 1350
const PAD = 96

type Palette = {
  background: string
  surface: string
  ink: string
  muted: string
  primary: string
  accent: string
  stroke: string
}

function palette(theme: CardTheme): Palette {
  const colors = theme === 'dark' ? darkTheme.colors : activeTheme.colors
  return {
    background: colors.surface.canvas,
    surface: colors.surface.elevated,
    ink: colors.ink.primary,
    muted: colors.ink.muted,
    primary: colors.primary.DEFAULT,
    accent: colors.secondary[theme === 'dark' ? 400 : 700],
    stroke: colors.stroke.DEFAULT,
  }
}

/** The line under a book on its card, e.g. "Finished in March 2026" */
export function bookCardStatus(book: Book): string | null {
  switch (book.progress.status) {
    case 'read': {
      const finished = getBookFinishedAt(book)
      return finished
        ? `Finished in ${dayjs.utc(finished).format('MMMM YYYY')}`
        : 'Finished'
    }
    case 'reading':
      return 'Reading now'
    case 'paused':
      return 'Paused'
    case 'not-finished':
      return 'Set aside'
    default:
      return 'On my shelf'
  }
}

const DISPLAY = '"Fraunces", Georgia, serif'
const BODY = '"Manrope", "Inter", system-ui, sans-serif'

/** Wraps `text` to lines no wider than `width`, as measured by `measure` */
export function wrapText(
  text: string,
  width: number,
  measure: (line: string) => number,
): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && measure(next) > width) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

/** At most `max` lines, the last ending in "…" when cut */
export function clampLines(lines: string[], max: number): string[] {
  if (lines.length <= max) return lines
  return [
    ...lines.slice(0, max - 1),
    `${lines[max - 1]!.replace(/[\s,.;:]*$/, '')}…`,
  ]
}

/** A font size that fits a quote of this length on the card */
export function quoteFontSize(length: number): number {
  if (length < 80) return 64
  if (length < 160) return 54
  if (length < 280) return 46
  if (length < 450) return 38
  return 32
}

async function loadFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  await Promise.allSettled([
    document.fonts.load(`600 64px ${DISPLAY}`),
    document.fonts.load(`italic 500 48px ${DISPLAY}`),
    document.fonts.load(`600 32px ${BODY}`),
    document.fonts.load(`800 24px ${BODY}`),
  ])
}

async function loadCover(src: string | null | undefined) {
  if (!src) return null
  try {
    const response = await fetch(src)
    if (!response.ok) return null
    return await createImageBitmap(await response.blob())
  } catch {
    return null
  }
}

function createCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Images can’t be drawn here')
  return { canvas, context }
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No image'))),
      'image/png',
    ),
  )
}

function frame(context: CanvasRenderingContext2D, colors: Palette) {
  context.fillStyle = colors.background
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  // Wordmark
  context.fillStyle = colors.primary
  context.font = `800 26px ${BODY}`
  context.letterSpacing = '6px'
  context.textBaseline = 'alphabetic'
  context.fillText('BOOKLIB', PAD, PAD + 10)
  context.letterSpacing = '0px'
  // Footer rule
  context.fillStyle = colors.stroke
  context.fillRect(PAD, CARD_HEIGHT - PAD - 40, CARD_WIDTH - PAD * 2, 2)
}

function footer(
  context: CanvasRenderingContext2D,
  colors: Palette,
  text: string,
) {
  context.fillStyle = colors.muted
  context.font = `600 26px ${BODY}`
  context.fillText(text, PAD, CARD_HEIGHT - PAD + 6)
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

/** A cover, or a placeholder with the title, filling the box */
function drawCover(
  context: CanvasRenderingContext2D,
  colors: Palette,
  cover: ImageBitmap | null,
  title: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.save()
  context.shadowColor = 'rgba(0, 0, 0, 0.28)'
  context.shadowBlur = 40
  context.shadowOffsetY = 18
  roundRect(context, x, y, width, height, 10)
  context.fillStyle = colors.surface
  context.fill()
  context.restore()

  context.save()
  roundRect(context, x, y, width, height, 10)
  context.clip()
  if (cover) {
    // Cover the box, cropping the overflow
    const scale = Math.max(width / cover.width, height / cover.height)
    const drawWidth = cover.width * scale
    const drawHeight = cover.height * scale
    context.drawImage(
      cover,
      x + (width - drawWidth) / 2,
      y + (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    )
  } else {
    context.fillStyle = colors.primary
    context.fillRect(x, y, width, height)
    context.fillStyle = 'rgba(255,255,255,0.92)'
    const size = Math.round(width / 9)
    context.font = `600 ${size}px ${DISPLAY}`
    const lines = clampLines(
      wrapText(title, width - 48, (line) => context.measureText(line).width),
      5,
    )
    lines.forEach((line, index) =>
      context.fillText(line, x + 24, y + 36 + size * 1.15 * (index + 1)),
    )
  }
  context.restore()
}

function stars(rating: number) {
  const full = Math.floor(rating)
  return (
    '★'.repeat(full) +
    (rating % 1 ? '½' : '') +
    '☆'.repeat(5 - Math.ceil(rating))
  )
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export type BookCardInput = {
  book: Book
  author: string | null
  // e.g. "Finished in March 2026" or "Reading now"
  status: string | null
}

export async function renderBookCard(
  { book, author, status }: BookCardInput,
  theme: CardTheme,
): Promise<Blob> {
  await loadFonts()
  const cover = await loadCover(book.coverSrc)
  const { canvas, context } = createCanvas()
  const colors = palette(theme)
  frame(context, colors)

  const coverWidth = 460
  const coverHeight = 690
  drawCover(
    context,
    colors,
    cover,
    book.title,
    (CARD_WIDTH - coverWidth) / 2,
    PAD + 70,
    coverWidth,
    coverHeight,
  )

  let y = PAD + 70 + coverHeight + 100
  context.textAlign = 'center'
  context.fillStyle = colors.ink
  context.font = `600 60px ${DISPLAY}`
  const titleLines = clampLines(
    wrapText(
      book.title,
      CARD_WIDTH - PAD * 2,
      (l) => context.measureText(l).width,
    ),
    2,
  )
  titleLines.forEach((line) => {
    context.fillText(line, CARD_WIDTH / 2, y)
    y += 70
  })
  if (author) {
    context.fillStyle = colors.muted
    context.font = `500 34px ${BODY}`
    context.fillText(`by ${author}`, CARD_WIDTH / 2, y)
    y += 64
  }
  if (book.rating) {
    context.fillStyle = colors.accent
    context.font = `500 40px ${BODY}`
    context.fillText(stars(book.rating), CARD_WIDTH / 2, y)
    y += 56
  }
  if (status) {
    context.fillStyle = colors.primary
    context.font = `700 28px ${BODY}`
    context.fillText(status.toUpperCase(), CARD_WIDTH / 2, y)
  }
  context.textAlign = 'left'

  footer(context, colors, 'From my library on BookLib')
  return toPng(canvas)
}

export type QuoteCardInput = {
  note: BookNote
  title: string
  author: string | null
}

export async function renderQuoteCard(
  { note, title, author }: QuoteCardInput,
  theme: CardTheme,
): Promise<Blob> {
  await loadFonts()
  const { canvas, context } = createCanvas()
  const colors = palette(theme)
  frame(context, colors)

  // A large opening quote mark
  context.fillStyle = colors.accent
  context.font = `600 220px ${DISPLAY}`
  context.fillText('“', PAD - 12, PAD + 250)

  const size = quoteFontSize(note.content.length)
  context.fillStyle = colors.ink
  context.font = `italic 500 ${size}px ${DISPLAY}`
  const lines = clampLines(
    wrapText(
      note.content,
      CARD_WIDTH - PAD * 2,
      (l) => context.measureText(l).width,
    ),
    Math.floor(720 / (size * 1.35)),
  )
  let y = PAD + 330
  lines.forEach((line) => {
    context.fillText(line, PAD, y)
    y += size * 1.35
  })

  y += 40
  context.fillStyle = colors.primary
  context.fillRect(PAD, y, 64, 4)
  y += 64
  context.fillStyle = colors.ink
  context.font = `600 36px ${DISPLAY}`
  context.fillText(
    clampLines(
      wrapText(
        title,
        CARD_WIDTH - PAD * 2,
        (l) => context.measureText(l).width,
      ),
      1,
    )[0]!,
    PAD,
    y,
  )
  const byline = [author, note.page ? `p. ${note.page}` : null]
    .filter(Boolean)
    .join(' · ')
  if (byline) {
    context.fillStyle = colors.muted
    context.font = `500 30px ${BODY}`
    context.fillText(byline, PAD, y + 50)
  }

  footer(context, colors, 'Highlighted on BookLib')
  return toPng(canvas)
}

export type YearCardInput = {
  year: number
  isCurrent: boolean
  stats: { label: string; value: string }[]
  topGenres: string[]
  // Up to three
  topBooks: { title: string; coverSrc: string | null }[]
}

export async function renderYearCard(
  { year, isCurrent, stats, topGenres, topBooks }: YearCardInput,
  theme: CardTheme,
): Promise<Blob> {
  await loadFonts()
  const covers = await Promise.all(
    topBooks.slice(0, 3).map(({ coverSrc }) => loadCover(coverSrc)),
  )
  const { canvas, context } = createCanvas()
  const colors = palette(theme)
  frame(context, colors)

  context.fillStyle = colors.muted
  context.font = `700 28px ${BODY}`
  context.letterSpacing = '4px'
  context.fillText(
    isCurrent ? 'SO FAR THIS YEAR' : 'YEAR IN REVIEW',
    PAD,
    PAD + 110,
  )
  context.letterSpacing = '0px'
  context.fillStyle = colors.ink
  context.font = `600 88px ${DISPLAY}`
  context.fillText(`My ${year} in books`, PAD, PAD + 210)

  // Two by two stats
  const cellWidth = (CARD_WIDTH - PAD * 2 - 32) / 2
  stats.slice(0, 4).forEach(({ label, value }, index) => {
    const x = PAD + (index % 2) * (cellWidth + 32)
    const y = PAD + 280 + Math.floor(index / 2) * 190
    roundRect(context, x, y, cellWidth, 160, 18)
    context.fillStyle = colors.surface
    context.fill()
    context.fillStyle = colors.primary
    context.font = `600 72px ${DISPLAY}`
    context.fillText(value, x + 32, y + 88)
    context.fillStyle = colors.muted
    context.font = `600 28px ${BODY}`
    context.fillText(label, x + 32, y + 132)
  })

  let y = PAD + 280 + 2 * 190 + 40
  if (topGenres.length) {
    context.fillStyle = colors.ink
    context.font = `600 32px ${BODY}`
    const genreLine = clampLines(
      wrapText(
        `Mostly ${topGenres.slice(0, 3).join(', ')}`,
        CARD_WIDTH - PAD * 2,
        (l) => context.measureText(l).width,
      ),
      1,
    )[0]!
    context.fillText(genreLine, PAD, y)
    y += 50
  }

  if (topBooks.length) {
    const width = 200
    const height = 300
    topBooks
      .slice(0, 3)
      .forEach((book, index) =>
        drawCover(
          context,
          colors,
          covers[index] ?? null,
          book.title,
          PAD + index * (width + 40),
          y,
          width,
          height,
        ),
      )
  }

  footer(context, colors, 'My year on BookLib')
  return toPng(canvas)
}
