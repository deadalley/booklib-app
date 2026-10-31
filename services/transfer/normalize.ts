import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import languageOptions from '~/public/languages-2.json'
import type { BookNote } from '~/types/book'
import { fromSimpleDate, isSimpleDate } from '~/utils/date'
import {
  FIELD_BY_KEY,
  emptyBookRecord,
  resolveFieldKey,
  type BookRecord,
  type FieldDefinition,
  type FieldKey,
  type TransferIssue,
} from './schema'

dayjs.extend(utc)

export type RawRow = Record<string, unknown>

export type NormalizeResult = {
  records: BookRecord[]
  issues: TransferIssue[]
  /** Source row number (1-based) of each record, aligned with `records`. */
  rows: number[]
}

/** Columns that are recognised but intentionally not imported. */
const IGNORED_COLUMNS = new Set(
  ['id', 'collections', 'authorid', 'bookid', 'order', 'selected'].map((c) =>
    c.toLowerCase(),
  ),
)

const LANGUAGES = languageOptions as Record<string, string>
const LANGUAGE_BY_NAME = new Map(
  Object.entries(LANGUAGES).map(([code, name]) => [name.toLowerCase(), code]),
)
const LANGUAGE_BY_CODE = new Map(
  Object.keys(LANGUAGES).map((code) => [code.toLowerCase(), code]),
)

const ENUM_SYNONYMS: Partial<Record<FieldKey, Record<string, string | null>>> =
  {
    progressStatus: {
      'currently-reading': 'reading',
      'in-progress': 'reading',
      started: 'reading',
      finished: 'read',
      completed: 'read',
      done: 'read',
      'on-hold': 'paused',
      dnf: 'not-finished',
      abandoned: 'not-finished',
      'did-not-finish': 'not-finished',
      'not-started': null,
      unread: null,
      'to-read': null,
      'want-to-read': null,
    },
    format: {
      hardback: 'hardcover',
      'mass-market-paperback': 'paperback',
      'trade-paperback': 'paperback',
      softcover: 'paperback',
      'e-book': 'ebook',
      'kindle-edition': 'ebook',
      kindle: 'ebook',
      epub: 'ebook',
      audio: 'audiobook',
      audible: 'audiobook',
      'audio-cd': 'audiobook',
      'audible-audio': 'audiobook',
    },
    propertyStatus: {
      true: 'owned',
      yes: 'owned',
      '1': 'owned',
      own: 'owned',
      false: 'not-owned',
      no: 'not-owned',
      '0': 'not-owned',
      wishlist: 'not-owned',
    },
  }

function isBlank(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  )
}

class RowContext {
  constructor(
    readonly row: number,
    readonly issues: TransferIssue[],
  ) {}

  warn(field: FieldKey, message: string) {
    this.issues.push({ row: this.row, field, message, severity: 'warning' })
  }

  error(field: FieldKey | undefined, message: string) {
    this.issues.push({ row: this.row, field, message, severity: 'error' })
  }
}

function toText(value: unknown): string | null {
  if (isBlank(value)) return null
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return null
}

function coerceInteger(
  value: unknown,
  field: FieldDefinition,
  ctx: RowContext,
): number | null {
  if (isBlank(value)) return null
  const num = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isFinite(num)) {
    ctx.warn(field.key, `${field.label} "${String(value)}" is not a number`)
    return null
  }
  const int = Math.round(num)
  if (field.key === 'year' && (int < -3000 || int > 9999)) {
    ctx.warn(field.key, `${field.label} ${int} is out of range`)
    return null
  }
  if (field.key !== 'year' && int < 0) {
    ctx.warn(field.key, `${field.label} cannot be negative`)
    return null
  }
  // A year/pages of 0 almost always means "unknown" in spreadsheets
  if ((field.key === 'year' || field.key === 'pages') && int === 0) {
    return null
  }
  return int
}

function coerceRating(value: unknown, ctx: RowContext): number | null {
  if (isBlank(value)) return null
  const num = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isFinite(num) || num < 0 || num > 5) {
    ctx.warn('rating', `Rating "${String(value)}" must be between 0 and 5`)
    return null
  }
  // 0 means "not rated" in most exports
  return num === 0 ? null : Math.round(num)
}

/** Parses a date into the stored ISO format; calendar days stay on their day. */
export function coerceDate(value: unknown): string | null | undefined {
  if (isBlank(value)) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString()
  }
  const text = String(value).trim()
  const simple = text.replace(/^(\d{4})[/.](\d{2})[/.](\d{2})$/, '$1-$2-$3')
  if (isSimpleDate(simple)) {
    return dayjs.utc(simple).isValid() &&
      dayjs.utc(simple).format('YYYY-MM-DD') === simple
      ? fromSimpleDate(simple)
      : undefined
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const parsed = dayjs(text)
    return parsed.isValid() ? parsed.utc().toISOString() : undefined
  }
  return undefined
}

function coerceDateField(
  value: unknown,
  field: FieldDefinition,
  ctx: RowContext,
): string | null {
  const date = coerceDate(value)
  if (date === undefined) {
    ctx.warn(
      field.key,
      `${field.label} "${String(value)}" is not a valid date (use YYYY-MM-DD)`,
    )
    return null
  }
  return date
}

function coerceLanguage(
  value: unknown,
  field: FieldDefinition,
  ctx: RowContext,
): string | null {
  const text = toText(value)
  if (!text) return null
  const byCode = LANGUAGE_BY_CODE.get(text.toLowerCase())
  if (byCode) return byCode
  const byName = LANGUAGE_BY_NAME.get(text.toLowerCase())
  if (byName) return byName
  ctx.warn(
    field.key,
    `Unknown ${field.label.toLowerCase()} "${text}" kept as-is`,
  )
  return text
}

export function coerceList(value: unknown): string[] {
  let items: unknown[]
  if (Array.isArray(value)) {
    items = value
  } else {
    const text = toText(value)
    if (!text) return []
    if (text.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(text)
        if (Array.isArray(parsed)) return coerceList(parsed)
      } catch {
        // not JSON, fall through to splitting
      }
    }
    const separator = /[;|]/.test(text) ? /[;|]/ : /,/
    items = text.split(separator)
  }

  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    const text = toText(item)
    if (!text || seen.has(text.toLowerCase())) continue
    seen.add(text.toLowerCase())
    result.push(text)
  }
  return result
}

function coerceEnum(
  value: unknown,
  field: FieldDefinition,
  ctx: RowContext,
): string | null {
  const text = toText(value)
  if (!text) return null
  const key = text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[()]/g, '')
  if (field.values?.includes(key)) return key
  const synonyms = ENUM_SYNONYMS[field.key]
  if (synonyms && key in synonyms) return synonyms[key] ?? null
  ctx.warn(
    field.key,
    `${field.label} "${text}" is not one of: ${field.values?.join(', ')}`,
  )
  return null
}

function coerceNotes(value: unknown, ctx: RowContext): BookNote[] {
  if (isBlank(value)) return []
  let items: unknown = value
  if (typeof value === 'string') {
    const text = value.trim()
    try {
      items = JSON.parse(text)
    } catch {
      // A plain string is treated as a single undated note
      return [{ createdAt: new Date().toISOString(), content: text }]
    }
  }
  if (!Array.isArray(items)) {
    ctx.warn('notes', 'Notes must be a list')
    return []
  }

  const notes: BookNote[] = []
  items.forEach((item, index) => {
    if (typeof item === 'string' && item.trim()) {
      notes.push({ createdAt: new Date().toISOString(), content: item.trim() })
      return
    }
    if (typeof item !== 'object' || item === null) {
      ctx.warn('notes', `Note ${index + 1} is not valid and was skipped`)
      return
    }
    const raw = item as Record<string, unknown>
    const content = toText(raw.content) ?? ''
    const page = isBlank(raw.page) ? undefined : Number(raw.page)
    const createdAt = coerceDate(raw.createdAt ?? raw.created_at ?? raw.date)
    if (!content && page === undefined) {
      ctx.warn('notes', `Note ${index + 1} is empty and was skipped`)
      return
    }
    if (page !== undefined && (!Number.isFinite(page) || page < 0)) {
      ctx.warn('notes', `Note ${index + 1} has an invalid page`)
    }
    notes.push({
      ...(typeof raw.id === 'string' ? { id: raw.id } : {}),
      createdAt: createdAt ?? new Date().toISOString(),
      content,
      ...(page !== undefined && Number.isFinite(page) && page >= 0
        ? { page: Math.round(page) }
        : {}),
    })
  })
  return notes
}

/**
 * Lifts nested `progress` objects (BookLib JSON / app model) to flat keys so
 * every source is read through the same field registry.
 */
function flattenRow(raw: RawRow): RawRow {
  const { progress, ...rest } = raw
  if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
    const p = progress as RawRow
    return {
      ...rest,
      progressStatus: p.status ?? rest.progressStatus,
      startedAt: p.startedAt ?? rest.startedAt,
      finishedAt: p.finishedAt ?? rest.finishedAt,
      currentPage: p.currentPage ?? rest.currentPage,
      notes: p.notes ?? rest.notes,
    }
  }
  return rest
}

function applyField(
  record: BookRecord,
  field: FieldDefinition,
  value: unknown,
  ctx: RowContext,
) {
  switch (field.key) {
    case 'title':
      record.title = toText(value) ?? ''
      return
    case 'author':
      record.author = Array.isArray(value)
        ? (coerceList(value)[0] ?? null)
        : toText(value)
      return
    case 'originalTitle':
    case 'publisher':
    case 'isbn':
    case 'summary':
    case 'coverSrc':
      record[field.key] = toText(value)
      return
    case 'language':
    case 'originalLanguage':
      record[field.key] = coerceLanguage(value, field, ctx)
      return
    case 'year':
    case 'pages':
      record[field.key] = coerceInteger(value, field, ctx)
      return
    case 'currentPage':
      record.progress.currentPage = coerceInteger(value, field, ctx)
      return
    case 'rating':
      record.rating = coerceRating(value, ctx)
      return
    case 'genres':
      record.genres = coerceList(value)
      return
    case 'format':
      record.format = coerceEnum(value, field, ctx) as BookRecord['format']
      return
    case 'propertyStatus':
      record.propertyStatus = coerceEnum(
        value,
        field,
        ctx,
      ) as BookRecord['propertyStatus']
      return
    case 'progressStatus':
      record.progress.status = coerceEnum(
        value,
        field,
        ctx,
      ) as BookRecord['progress']['status']
      return
    case 'createdAt':
      record.createdAt = coerceDateField(value, field, ctx)
      return
    case 'startedAt':
    case 'finishedAt':
      record.progress[field.key] = coerceDateField(value, field, ctx)
      return
    case 'notes':
      record.progress.notes = coerceNotes(value, ctx)
      return
  }
}

function checkConsistency(record: BookRecord, ctx: RowContext) {
  const { startedAt, finishedAt, currentPage } = record.progress
  if (startedAt && finishedAt && finishedAt < startedAt) {
    ctx.warn('finishedAt', 'Finished date is before the start date')
  }
  if (
    currentPage !== null &&
    record.pages !== null &&
    currentPage > record.pages
  ) {
    ctx.warn('currentPage', 'Current page is greater than the number of pages')
  }
}

/**
 * Validates and converts raw rows (from CSV or JSON) into `BookRecord`s.
 * Never throws for bad data: problems are reported as issues, rows without a
 * title are skipped and invalid values are dropped.
 */
export function normalizeRows(rows: RawRow[]): NormalizeResult {
  const issues: TransferIssue[] = []
  const records: BookRecord[] = []
  const sourceRows: number[] = []
  const unknownColumns = new Set<string>()

  rows.forEach((raw, index) => {
    const ctx = new RowContext(index + 1, issues)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      ctx.error(undefined, 'Row is not an object and was skipped')
      return
    }

    const record = emptyBookRecord()
    const seen = new Set<FieldKey>()

    for (const [column, value] of Object.entries(flattenRow(raw))) {
      const key = resolveFieldKey(column)
      if (!key) {
        if (!IGNORED_COLUMNS.has(column.toLowerCase().replace(/[_\s]/g, ''))) {
          unknownColumns.add(column)
        }
        continue
      }
      // When several columns map to the same field, the first non-blank wins
      if (seen.has(key) && isBlank(value)) continue
      if (seen.has(key)) continue
      if (!isBlank(value)) seen.add(key)
      applyField(record, FIELD_BY_KEY[key], value, ctx)
    }

    if (!record.title) {
      ctx.error('title', 'Missing title, row skipped')
      return
    }

    checkConsistency(record, ctx)
    records.push(record)
    sourceRows.push(index + 1)
  })

  if (unknownColumns.size) {
    issues.unshift({
      row: 0,
      message: `Ignored unknown columns: ${[...unknownColumns].join(', ')}`,
      severity: 'warning',
    })
  }

  return { records, issues, rows: sourceRows }
}
