import Papa from 'papaparse'
import languageOptions from '~/public/languages-2.json'
import type { Book } from '~/types/book'
import {
  isFileReaderStringResult,
  isBookImportResult,
} from '~/utils/type-guards'

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
          const languageMap = Object.entries(languageOptions).reduce<
            Record<string, string>
          >((acc, [key, value]) => ({ ...acc, [value]: key }), {})
          return languageMap[capitalize(value)] || value
        }
        return value
      },
      complete: ({ data, errors }) => {
        if (errors.length) {
          reject(errors[0]?.message || 'CSV parsing error')
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
          // Use type guard instead of type assertion
          if (!isFileReaderStringResult(e.target.result)) {
            reject('FileReader result is not a string')
            return
          }
          const parsed = JSON.parse(e.target.result)
          if (isBookImportResult(parsed)) {
            resolve(parsed.books as Book[])
          } else {
            reject('Invalid JSON structure: expected object with "books" array')
          }
        } catch {
          reject('Invalid JSON file')
        }
      } else {
        reject('Could not parse data')
      }
    }

    fileReader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
  })
}
