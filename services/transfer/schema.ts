import type {
  BookFormat,
  BookNote,
  BookProgressStatus,
  BookPropertyStatus,
} from '~/types/book'

/**
 * Canonical interchange format used by every import and export.
 *
 * It holds every book field except collections. The author is stored by
 * **name** (not id) so files stay portable between libraries.
 */
export type BookRecord = {
  title: string
  author: string | null
  originalTitle: string | null
  publisher: string | null
  language: string | null
  originalLanguage: string | null
  year: number | null
  pages: number | null
  isbn: string | null
  rating: number | null
  summary: string | null
  genres: string[]
  format: BookFormat | null
  propertyStatus: BookPropertyStatus | null
  coverSrc: string | null
  createdAt: string | null
  progress: {
    status: BookProgressStatus | null
    startedAt: string | null
    finishedAt: string | null
    currentPage: number | null
    notes: BookNote[]
  }
}

export type TransferFormat = 'csv' | 'json'

export const TRANSFER_FORMAT = 'booklib'
export const TRANSFER_VERSION = 1

/** JSON envelope written by `serializeJson`. */
export type BookRecordFile = {
  format: typeof TRANSFER_FORMAT
  version: number
  exportedAt: string
  books: BookRecord[]
}

export type IssueSeverity = 'error' | 'warning'

export type TransferIssue = {
  /** 1-based row/item number in the source file (0 = whole file). */
  row: number
  field?: FieldKey
  message: string
  severity: IssueSeverity
}

export type FieldType =
  | 'string'
  | 'text'
  | 'integer'
  | 'rating'
  | 'date'
  | 'language'
  | 'list'
  | 'notes'
  | 'enum'

/** Flat field keys as they appear in CSV files and flat JSON rows. */
export type FieldKey =
  | 'title'
  | 'author'
  | 'originalTitle'
  | 'publisher'
  | 'language'
  | 'originalLanguage'
  | 'year'
  | 'pages'
  | 'isbn'
  | 'rating'
  | 'summary'
  | 'genres'
  | 'format'
  | 'propertyStatus'
  | 'coverSrc'
  | 'createdAt'
  | 'progressStatus'
  | 'startedAt'
  | 'finishedAt'
  | 'currentPage'
  | 'notes'

export type FieldDefinition = {
  key: FieldKey
  /** Column header used when writing CSV. */
  header: string
  label: string
  type: FieldType
  /** Allowed values for `enum` fields. */
  values?: readonly string[]
  /**
   * Alternative names accepted when reading (compared after normalisation:
   * lower case, no spaces/underscores/dashes).
   */
  aliases?: string[]
  required?: boolean
}

export const PROGRESS_STATUS_VALUES = [
  'reading',
  'paused',
  'read',
  'not-finished',
] as const satisfies readonly BookProgressStatus[]

export const PROPERTY_STATUS_VALUES = [
  'owned',
  'not-owned',
] as const satisfies readonly BookPropertyStatus[]

export const FORMAT_VALUES = [
  'hardcover',
  'paperback',
  'ebook',
  'audiobook',
  'other',
] as const satisfies readonly BookFormat[]

/**
 * Single source of truth for the file layout. CSV headers, JSON keys, template
 * files and validation are all derived from this list, so they cannot drift.
 */
export const FIELDS: readonly FieldDefinition[] = [
  {
    key: 'title',
    header: 'TITLE',
    label: 'Title',
    type: 'string',
    required: true,
    aliases: ['name', 'booktitle'],
  },
  {
    key: 'author',
    header: 'AUTHOR',
    label: 'Author',
    type: 'string',
    aliases: ['authorname', 'authors', 'writer'],
  },
  {
    key: 'originalTitle',
    header: 'ORIGINAL_TITLE',
    label: 'Original title',
    type: 'string',
  },
  { key: 'publisher', header: 'PUBLISHER', label: 'Publisher', type: 'string' },
  { key: 'language', header: 'LANGUAGE', label: 'Language', type: 'language' },
  {
    key: 'originalLanguage',
    header: 'ORIGINAL_LANGUAGE',
    label: 'Original language',
    type: 'language',
  },
  {
    key: 'year',
    header: 'YEAR',
    label: 'Year',
    type: 'integer',
    aliases: ['yearpublished', 'publicationyear', 'originalpublicationyear'],
  },
  {
    key: 'pages',
    header: 'PAGES',
    label: 'Pages',
    type: 'integer',
    aliases: ['numberofpages', 'pagecount'],
  },
  {
    key: 'isbn',
    header: 'ISBN',
    label: 'ISBN',
    type: 'string',
    aliases: ['isbn13', 'isbn10'],
  },
  {
    key: 'rating',
    header: 'RATING',
    label: 'Rating',
    type: 'rating',
    aliases: ['myrating'],
  },
  {
    key: 'summary',
    header: 'SUMMARY',
    label: 'Summary',
    type: 'text',
    aliases: ['description'],
  },
  {
    key: 'genres',
    header: 'GENRES',
    label: 'Genres',
    type: 'list',
    aliases: ['genre', 'tags', 'bookshelves'],
  },
  {
    key: 'format',
    header: 'FORMAT',
    label: 'Format',
    type: 'enum',
    values: FORMAT_VALUES,
    aliases: ['bookformat', 'binding'],
  },
  {
    key: 'propertyStatus',
    header: 'PROPERTY_STATUS',
    label: 'Ownership',
    type: 'enum',
    values: PROPERTY_STATUS_VALUES,
    aliases: ['ownership', 'owned'],
  },
  {
    key: 'coverSrc',
    header: 'COVER',
    label: 'Cover URL',
    type: 'string',
    aliases: ['coversrc', 'coverurl', 'cover_src'],
  },
  {
    key: 'createdAt',
    header: 'ADDED_AT',
    label: 'Added on',
    type: 'date',
    aliases: ['createdat', 'dateadded'],
  },
  {
    key: 'progressStatus',
    header: 'PROGRESS_STATUS',
    label: 'Progress status',
    type: 'enum',
    values: PROGRESS_STATUS_VALUES,
    aliases: ['status', 'readstatus'],
  },
  {
    key: 'startedAt',
    header: 'STARTED_AT',
    label: 'Started on',
    type: 'date',
    aliases: ['datestarted'],
  },
  {
    key: 'finishedAt',
    header: 'FINISHED_AT',
    label: 'Finished on',
    type: 'date',
    aliases: ['dateread', 'datefinished'],
  },
  {
    key: 'currentPage',
    header: 'CURRENT_PAGE',
    label: 'Current page',
    type: 'integer',
  },
  { key: 'notes', header: 'NOTES', label: 'Notes', type: 'notes' },
]

export const FIELD_BY_KEY = Object.fromEntries(
  FIELDS.map((field) => [field.key, field]),
) as Record<FieldKey, FieldDefinition>

/** Normalises a column name/key for lookup: `Original_Title` → `originaltitle`. */
export function normalizeFieldName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[\s_\-.]/g, '')
}

const FIELD_LOOKUP: Map<string, FieldKey> = (() => {
  const map = new Map<string, FieldKey>()
  for (const field of FIELDS) {
    map.set(normalizeFieldName(field.key), field.key)
    map.set(normalizeFieldName(field.header), field.key)
    for (const alias of field.aliases ?? []) {
      map.set(normalizeFieldName(alias), field.key)
    }
  }
  return map
})()

/** Maps any accepted column name (header, key, snake_case, alias) to a field. */
export function resolveFieldKey(name: string): FieldKey | undefined {
  return FIELD_LOOKUP.get(normalizeFieldName(name))
}

export function emptyBookRecord(title = ''): BookRecord {
  return {
    title,
    author: null,
    originalTitle: null,
    publisher: null,
    language: null,
    originalLanguage: null,
    year: null,
    pages: null,
    isbn: null,
    rating: null,
    summary: null,
    genres: [],
    format: null,
    propertyStatus: null,
    coverSrc: null,
    createdAt: null,
    progress: {
      status: null,
      startedAt: null,
      finishedAt: null,
      currentPage: null,
      notes: [],
    },
  }
}
