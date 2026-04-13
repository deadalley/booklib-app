<template>
  <div class="grid grid-cols-3 gap-6">
    <div
      v-for="field in fields"
      :key="field.label"
      class="bg-surface-canvas/70 flex flex-col gap-1 rounded-2xl p-4"
    >
      <p class="label">{{ field.label }}</p>
      <div class="flex items-center gap-2">
        <component
          :is="icons[field.icon]"
          v-if="field.icon"
          :size="ICON_SIZE_SMALL"
        />
        <p class="value">{{ field.value || '-' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { Book } from '~/types/book'
import languageOptions from '~/public/languages-2.json'
import { BOOK_FORMAT_MAP } from '~/utils/constants'

const props = defineProps<{
  book: Book
}>()

const fields = computed(() => {
  return [
    { label: 'Publisher', value: props.book.publisher },
    {
      label: 'Language',
      value: props.book.language
        ? (languageOptions[
            props.book.language as keyof typeof languageOptions
          ] ?? props.book.language)
        : undefined,
    },
    { label: 'Year', value: props.book.year?.toString() },
    { label: 'Original Title', value: props.book.originalTitle },
    {
      label: 'Original Language',
      value: props.book.originalLanguage
        ? (languageOptions[
            props.book.originalLanguage as keyof typeof languageOptions
          ] ?? props.book.originalLanguage)
        : undefined,
    },
    { label: 'Pages', value: props.book.pages?.toString() },
    {
      label: 'Format',
      value: props.book.format
        ? BOOK_FORMAT_MAP[props.book.format]?.description
        : undefined,
      icon: props.book.format
        ? (BOOK_FORMAT_MAP[props.book.format]?.icon as keyof typeof icons)
        : undefined,
    },
  ]
})
</script>

<style scoped>
@reference '../../assets/css/main.css';

.label {
  @apply text-ink-muted text-sm font-semibold tracking-wider uppercase;
}
.value {
  @apply text-ink-primary text-xl font-bold;
}
</style>
