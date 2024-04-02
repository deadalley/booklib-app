import { flatten, uniqBy } from 'lodash'

export function getUniqueElements<
  T extends Record<K, unknown>,
  K extends keyof T,
>(elements: T[], key: K): Exclude<T[K], null>[] {
  return elements
    .reduce<T[K][]>((uniqueKeys, element) => {
      const value = element[key]
      if (!uniqueKeys.includes(value)) {
        uniqueKeys.push(value)
      }
      return uniqueKeys
    }, [])
    .filter((p): p is Exclude<T[K], null> => !!p)
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
  T extends Record<K, unknown>,
  K extends keyof T,
>(key: K, elements: T[], selectedArray: T[K][]): T[] {
  return elements.filter(
    (element) => element[key] && selectedArray.includes(element[key]),
  )
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
  return uniqBy(flatten(elements), key)
}
