import Papa from 'papaparse'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

export function createCsvFile<T extends Book | Collection>(
  values: T[],
): string {
  return Papa.unparse(values, {
    header: true,
    skipEmptyLines: true,
  })
}
