<template>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-6">
    <dl
      v-for="(group, index) in fieldGroups"
      :key="index"
      class="m-0 flex min-w-0 flex-col gap-4"
    >
      <div
        v-for="field in group"
        :key="field.label"
        class="flex min-w-0 flex-col gap-1"
      >
        <dt class="label">{{ field.label }}</dt>
        <dd class="value" :class="{ empty: !field.value }">
          <component
            :is="icons[field.icon]"
            v-if="field.icon"
            :size="16"
            stroke="1.6"
          />
          {{ field.value || '—' }}
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { Book } from '~/types/book'
import languageOptions from '~/public/languages-2.json'
import { BOOK_FORMAT_MAP } from '~/utils/constants'

type Field = {
  label: string
  value?: string | null
  icon?: keyof typeof icons
}

const props = defineProps<{
  book: Book
}>()

function languageLabel(code: string | null) {
  return code
    ? (languageOptions[code as keyof typeof languageOptions] ?? code)
    : undefined
}

const fieldGroups = computed<Field[][]>(() => {
  const format = props.book.format
    ? BOOK_FORMAT_MAP[props.book.format]
    : undefined

  return [
    [
      { label: 'Publisher', value: props.book.publisher },
      { label: 'Original Title', value: props.book.originalTitle },
    ],
    [
      { label: 'Year', value: props.book.year?.toString() },
      { label: 'Pages', value: props.book.pages?.toString() },
    ],
    [
      { label: 'Language', value: languageLabel(props.book.language) },
      {
        label: 'Original Language',
        value: languageLabel(props.book.originalLanguage),
      },
    ],
    [
      {
        label: 'Format',
        value: format?.description,
        icon: format?.icon as keyof typeof icons | undefined,
      },
    ],
  ]
})
</script>

<style scoped>
@reference '../../assets/css/main.css';

.label {
  @apply text-ink-muted text-xs font-semibold tracking-[0.08em] uppercase;
}
.value {
  @apply text-ink-primary m-0 flex items-center gap-1.5 text-base font-semibold wrap-anywhere;
}
.value.empty {
  @apply text-ink-subtle font-medium;
}
</style>
