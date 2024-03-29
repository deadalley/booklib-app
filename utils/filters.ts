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
