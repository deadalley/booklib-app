export function getMagnitude(value: number) {
  const order = Math.floor(Math.log(value) / Math.LN10 + 0.000000001) // float
  return Math.pow(10, order)
}

export function randomInt(min: number, max: number) {
  return (
    Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
    Math.ceil(min)
  )
}

export function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2
}

export function getRandomIndex<T>(array: T[]): number {
  return Math.floor(Math.random() * array.length)
}
