<template>
  <bl-tile :key="index" class="flex-1">
    <template #title>{{ selectedOption.label }}</template>
    <div class="flex h-full flex-1 items-center justify-center">
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

const options: (SelectOption & {
  value: 'rating' | 'progressStatus'
  unit?: string
})[] = [
  { label: 'Books by rating', value: 'rating', unit: '★' },
  { label: 'Books by progress status', value: 'progressStatus' },
]

const { index } = useAutoIncrementIndex(options.length, 14)

const selectedOption = computed(() => options[index.value])
</script>
