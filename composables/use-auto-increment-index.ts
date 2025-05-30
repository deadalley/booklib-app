export const useAutoIncrementIndex = (
  arrayLength: number,
  interval: number,
) => {
  const index = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    timer = setInterval(() => {
      index.value = (index.value + 1) % arrayLength
    }, interval * 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return index
}
