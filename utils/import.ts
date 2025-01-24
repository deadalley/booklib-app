import Papa from 'papaparse'
import type { Book } from '~/types/book'
import languageOptions from '~/public/languages-2.json'

export async function parseCsvFile(file: File): Promise<Book[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Book, File>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        return snakeCaseToCamelCase(header)
      },
      transform: (value: string, field: string) => {
        if (field === 'progressStatus') {
          return snakeCaseToKebabCase(value)
        }
        if (['pages', 'year', 'rating'].includes(field)) {
          return +value
        }
        if (['language', 'originalLanguage'].includes(field)) {
          return Object.entries(languageOptions).reduce<Record<string, string>>(
            (acc, [key, value]) => ({ ...acc, [value]: key }),
            {},
          )[capitalize(value)]
        }
        return value
      },
      complete: ({ data, errors }) => {
        if (errors.length) {
          reject(errors[0].message)
        } else {
          resolve(data)
        }
      },
    })
  })
}
