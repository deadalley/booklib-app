export async function executePromisesInChunks<T>(
  promises: Promise<T>[],
  chunkSize: number = 10,
): Promise<T[]> {
  const result: T[] = []
  for (let i = 0; i < promises.length; i += chunkSize) {
    const chunk = promises.slice(i, i + chunkSize)
    const chunkResult = await Promise.all(chunk)
    result.push(...chunkResult)
  }
  return result
}
