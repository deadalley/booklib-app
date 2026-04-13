<template>
  <header class="mb-12 flex flex-col gap-4">
    <!-- Title -->
    <h1>
      {{ book.title }}
    </h1>

    <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      <!-- Author -->
      <div class="flex items-baseline gap-3">
        <p class="text-ink-secondary font-semibold tracking-wide">by</p>
        <NuxtLink
          v-if="authorName"
          class="border-stroke hover:text-ink-secondary border-b text-xl font-bold tracking-wide"
          :to="`/authors/${book.author}`"
        >
          {{ authorName }}
        </NuxtLink>
      </div>

      <p class="text-ink-subtle hidden text-2xl md:block">•</p>

      <!-- Rating -->
      <div
        class="text-ink-primary inline-flex items-center gap-1 text-lg font-semibold"
      >
        <IconStarFilled
          :size="ICON_SIZE_SMALL"
          stroke="1.5"
          class="text-primary"
        />
        {{ ratingSummary }}
      </div>

      <p class="text-ink-subtle hidden text-2xl md:block">•</p>

      <!-- Created date -->
      <div
        v-if="formattedDate"
        class="flex items-baseline gap-3 leading-tight md:flex-1"
      >
        <p class="text-ink-secondary font-semibold tracking-wide">Added on</p>
        <h6 class="font-body font-bold">{{ formattedDate }}</h6>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IconStarFilled } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import { toFullDateCompact } from '~/utils/date'

const props = defineProps<{
  book: Book
  authors: Author[]
}>()

const authorName = computed(
  () => props.authors?.find(({ id }) => props.book.author === id)?.name,
)

const ratingSummary = computed(() => {
  const rating = props.book.rating

  if (!rating) return '-'

  return Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1)
})

const formattedDate = computed(() => toFullDateCompact(props.book.createdAt))
</script>

<style scoped></style>
