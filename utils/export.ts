import { mapKeys, omit } from 'lodash'
import Papa from 'papaparse'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

function preprocessData<T extends Book | Collection>(data: T[]) {
  return data.map((value) =>
    mapKeys(omit(value, 'id', 'collections', 'books'), (_, key) =>
      camelCaseToSnakeCase(key).toUpperCase(),
    ),
  )
}

export function createCsvFile<T extends Book | Collection>(data: T[]): string {
  const dataForExport = preprocessData(data)
  return Papa.unparse(dataForExport, {
    header: true,
    skipEmptyLines: true,
  })
}
