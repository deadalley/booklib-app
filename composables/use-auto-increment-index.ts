export const useAutoIncrementIndex = (
  arrayLength: number,
  interval: number,
) => {
  const index = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  function start(_interval: number = interval) {
    timer = setInterval(() => {
      index.value = (index.value + 1) % arrayLength
    }, _interval * 1_000)
  }

  function stop() {
    if (timer) clearInterval(timer)
  }

  onMounted(() => {
    start(interval)
  })

  onUnmounted(() => {})

  return {
    index,
    resetTimer: (newInterval: number) => {
      stop()
      start(newInterval)
    },
    stop,
    start,
  }
}
