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

/**
 * Normalises text for matching: trims, collapses whitespace, lower-cases and
 * removes diacritics, so "  García " matches "garcia".
 */
export function normalizeForMatch(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function filterElementsBySearchParam<
  T extends object,
  K extends keyof T,
>(elements: T[], searchParam?: string, keys?: K[]): T[] {
  const query = normalizeForMatch(searchParam)
  if (!query) {
    return elements
  }

  return elements.filter((element) =>
    Object.entries(element).some(([key, value]) => {
      if (value && (!keys || (keys as string[]).includes(key))) {
        return normalizeForMatch(value).includes(query)
      }
      return false
    }),
  )
}

/**
 * Keeps elements whose `key` value (or any of its values, for arrays) matches
 * one of the selected values. Matching ignores case, whitespace and accents.
 * An empty selection keeps every element.
 */
export function filterElementsBySelectedArray<
  T extends Partial<Record<K, unknown>>,
  K extends keyof T,
>(key: K, elements: T[], selected: readonly unknown[]): T[] {
  if (!selected.length) {
    return elements
  }

  const wanted = new Set(selected.map(normalizeForMatch))
  return elements.filter((element) => {
    const value = element[key]
    const values = Array.isArray(value) ? value : [value]
    return values.some(
      (item) =>
        item !== null &&
        item !== undefined &&
        wanted.has(normalizeForMatch(item)),
    )
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

function standardizeValue<K>(value: K) {
  return typeof value === 'string' ? (normalizeForMatch(value) as K) : value
}

export function isBookInDefaultCollection(
  book: Book,
  collectionId: string,
): boolean {
  return !!book.collections.some((id) => String(id) === collectionId)
}
