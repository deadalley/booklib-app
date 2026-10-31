import Papa from 'papaparse'
import { FIELDS, type BookRecord, type FieldKey } from '../schema'
import type { RawRow } from '../normalize'

/** Byte-order mark some spreadsheet apps prepend to UTF-8 files. */
const BOM = new RegExp('^\\uFEFF')

export type ParsedRows = {
  rows: RawRow[]
  /** File-level problems (malformed CSV etc.). */
  errors: string[]
}

/** Parses CSV text into raw rows keyed by the original header names. */
export function parseCsv(text: string): ParsedRows {
  const result = Papa.parse<RawRow>(text.replace(BOM, ''), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  })

  const errors = result.errors
    // A trailing delimiter on some rows is harmless
    .filter((error) => error.code !== 'TooManyFields')
    .map((error) =>
      error.row !== undefined
        ? `Row ${error.row + 1}: ${error.message}`
        : error.message,
    )

  if (!result.meta.fields?.length) {
    errors.push('The file has no header row')
  }

  return { rows: result.data, errors }
}

function recordValue(record: BookRecord, key: FieldKey): unknown {
  switch (key) {
    case 'progressStatus':
      return record.progress.status
    case 'startedAt':
    case 'finishedAt':
    case 'currentPage':
      return record.progress[key]
    case 'notes':
      return record.progress.notes.length
        ? JSON.stringify(record.progress.notes)
        : null
    case 'genres':
      return record.genres.join('; ')
    default:
      return record[key]
  }
}

/** Serialises records to CSV using the canonical headers. */
export function serializeCsv(records: BookRecord[]): string {
  const fields = FIELDS.map((field) => field.header)
  const data = records.map((record) =>
    FIELDS.map((field) => recordValue(record, field.key) ?? ''),
  )
  return Papa.unparse({ fields, data }, { newline: '\n' })
}
