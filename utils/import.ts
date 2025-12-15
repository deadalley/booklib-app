import Papa from 'papaparse'
import languageOptions from '~/public/languages-2.json'
import type { Book } from '~/types/book'

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
          return value ? +value : null
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
          reject(errors[0]?.message)
        } else {
          resolve(data)
        }
      },
    })
  })
}

export function parseJsonFile(file: File): Promise<Book[]> {
  const fileReader = new FileReader()

  fileReader.readAsText(file)

  return new Promise((resolve, reject) => {
    fileReader.onload = (e) => {
      if (e.target?.result) {
        try {
          resolve(JSON.parse(e.target.result as string).books)
        } catch {
          reject('Invalid JSON file')
        }
      } else {
        reject('Could not parse data')
      }
    }
  })
}
