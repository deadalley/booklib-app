<template>
  <bl-tile :key="index" class="flex-1">
    <template #title>{{ selectedOption.label }}</template>
    <div class="flex flex-1 items-center justify-center">
      <bl-books-pie-chart
        :books="books"
        :book-property="selectedOption.value"
        :unit="selectedOption?.unit"
      />
    </div>
  </bl-tile>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import type { SelectOption } from './raw-select.vue'

defineProps<{
  books: Book[]
}>()

const index = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const options: (SelectOption & {
  value: 'rating' | 'progressStatus'
  unit?: string
})[] = [
  { label: 'Books by rating', value: 'rating', unit: '★' },
  { label: 'Books by progress status', value: 'progressStatus' },
]

const selectedOption = computed(() => options[index.value])

onMounted(() => {
  timer = setInterval(() => {
    index.value = (index.value + 1) % options.length
  }, 8 * 1_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
