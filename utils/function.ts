import { assoc, curry, reduce } from 'ramda'

export function renameKeys<
  D,
  T extends Record<string, D>,
  K extends Record<string, string>,
>(keyMap: K) {
  return curry(
    (obj: T): Record<string, D> =>
      reduce(
        (acc, key) => assoc(keyMap[key] || key, obj[key as keyof T], acc),
        {} as Record<string, D>,
        Object.keys(obj),
      ),
  )
}
