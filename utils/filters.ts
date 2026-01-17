import { flatten, intersection, prop, uniqBy } from 'ramda'
import type { Book } from '~/types/book'

export function getUniqueElements<
  T extends Partial<Record<K, unknown>>,
  K extends keyof T,
>(elements: T[], key: K): Exclude<T[K], null | undefined>[] {
  return elements
    .reduce<T[K][]>((uniqueKeys, element) => {
      if (Array.isArray(element[key])) {
        element[key].forEach((value) => {
          if (
            !uniqueKeys.map(standardizeValue).includes(standardizeValue(value))
          ) {
            uniqueKeys.push(value)
          }
        })
      } else {
        if (
          !uniqueKeys
            .map(standardizeValue)
            .includes(standardizeValue(element[key]))
        ) {
          uniqueKeys.push(element[key])
        }
      }

      return uniqueKeys
    }, [])
    .filter((p): p is Exclude<T[K], null | undefined> => !!p)
    .sort((p1, p2) =>
      String(p1).localeCompare(String(p2), undefined, { numeric: true }),
    )
}

export function filterElementsBySearchParam<
  T extends object,
  K extends keyof T,
>(elements: T[], searchParam?: string, keys?: K[]): T[] {
  return elements.filter((element) => {
    if (!searchParam) {
      return elements
    }

    const lowerCaseSearchParam = searchParam?.toLowerCase()
    return Object.entries(element).some(([key, value]) => {
      if (value && (!keys || (keys as string[]).includes(key))) {
        return `${value}`.toLowerCase().includes(lowerCaseSearchParam)
      }
      return false
    })
  })
}

export function filterElementsBySelectedArray<
  T extends Partial<Record<K, unknown>>,
  K extends keyof T,
>(key: K, elements: T[], selectedArray: T[K][]): T[] {
  return elements.filter((element) => {
    const value = element[key]
    if (Array.isArray(value) && Array.isArray(selectedArray[0])) {
      return !!intersection(value, selectedArray[0] as typeof value).length
    }
    return value && selectedArray.includes(value)
  })
}

export function filterElementsByRange<T extends object, K extends keyof T>(
  key: K,
  elements: T[],
  range: [number, number],
): T[] {
  return elements.filter((element) => {
    const value = element[key]
    if (value === undefined || value === null) {
      return true
    }
    if (typeof value === 'number') {
      return value >= range[0] && value <= range[1]
    }
    return false
  })
}

export function mergeAndFilter<T extends object, K extends keyof T>(
  key: K,
  ...elements: T[][]
) {
  return uniqBy(prop(key), flatten(elements))
}

function standardizeValue<K>(value: K) {
  return typeof value === 'string' ? (value.trim().toLowerCase() as K) : value
}

export function isBookInDefaultCollection(
  book: Book,
  collectionId: string,
): boolean {
  return !!book.collections.some((id) => String(id) === collectionId)
}
