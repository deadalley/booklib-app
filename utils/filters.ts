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
      if (value && (!keys || keys.includes(key as K))) {
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
    if (Array.isArray(element[key])) {
      return !!intersection(
        element[key] as Array<T>,
        selectedArray[0] as Array<T>,
      ).length
    }
    return element[key] && selectedArray.includes(element[key])
  })
}

export function filterElementsByRange<T extends object, K extends keyof T>(
  key: K,
  elements: T[],
  range: [number, number],
): T[] {
  return elements.filter(
    (element) =>
      element[key] === undefined ||
      element[key] === null ||
      ((element[key] as number) >= range[0] &&
        (element[key] as number) <= range[1]),
  )
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
