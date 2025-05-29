import { curry, fromPairs, omit, toPairs } from 'ramda'
import Papa from 'papaparse'

const mapKeys = curry(
  <T>(fn: (key: string) => string, obj: Record<string, T>): Record<string, T> =>
    fromPairs(toPairs(obj).map(([k, v]) => [fn(k), v])),
)

function preprocessData<
  ID extends string | number,
  T extends { id: ID; collections?: string[]; books?: string[] },
>(data: T[]) {
  return data.map((value) =>
    mapKeys(
      (key) => camelCaseToSnakeCase(key).toUpperCase(),
      omit(['id', 'collections', 'books'], value),
    ),
  )
}

export function createCsvFile<
  ID extends string | number,
  T extends { id: ID; collections?: string[]; books?: string[] },
>(data: T[]): string {
  const dataForExport = preprocessData(data)
  return Papa.unparse(dataForExport, {
    header: true,
    skipEmptyLines: true,
  })
}
