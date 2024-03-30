export function filterElements<T extends object>(
  elements: T[],
  searchParam?: string,
): T[] {
  return elements.filter((element) => {
    if (!searchParam) {
      return elements
    }

    const lowerCaseSearchParam = searchParam?.toLowerCase()
    return Object.values(element).some((value) => {
      if (value) {
        return `${value}`.toLowerCase().includes(lowerCaseSearchParam)
      }
      return false
    })
  })
}

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
