<template>
  <header class="book-page-hero">
    <div class="book-page-hero-cover book-page-cover-frame">
      <NuxtImg
        v-if="book.coverSrc"
        :src="book.coverSrc"
        :alt="book.title"
        class="size-full object-cover object-center"
      />
      <bl-empty-book-image
        v-else
        class="rounded-none! p-4! text-base!"
        :icon-size="28"
      >
        {{ book.title }}
      </bl-empty-book-image>
    </div>

    <div class="flex min-w-0 flex-col gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="book-page-title">{{ book.title }}</h1>
        <p
          v-if="authorName"
          class="text-ink-secondary text-[1.125rem] font-medium"
        >
          by
          <span class="text-ink-primary border-stroke border-b font-bold">
            {{ authorName }}
          </span>
        </p>
      </div>

      <div
        class="text-ink-primary flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9375rem] font-semibold"
      >
        <div
          class="inline-flex items-center gap-2"
          :title="book.rating ? `${ratingSummary} out of 5` : undefined"
        >
          <bl-rating :rating="book.rating ?? 0" :icon-size="16" />
          <span>{{ ratingSummary }}</span>
        </div>
        <span class="bg-stroke h-4 w-px" aria-hidden="true" />
        <div v-if="formattedDate" class="inline-flex items-center gap-2">
          <span class="text-ink-muted font-medium">Added</span>
          <span>{{ formattedDate }}</span>
        </div>
      </div>

      <div v-if="(book.genres ?? []).length" class="flex flex-wrap gap-2">
        <bl-chip v-for="genre in book.genres" :key="genre" rounded>
          {{ genre }}
        </bl-chip>
      </div>

      <bl-book-page-default-collections
        class="mt-1"
        :selected="selectedDefaultCollections"
        @default-collection-change="
          (id) => $emit('default-collection-change', id)
        "
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import { toFullDateCompact } from '~/utils/date'

const props = defineProps<{
  book: Book
  authors: Author[]
  selectedDefaultCollections: Record<string, boolean>
}>()

defineEmits<{
  (e: 'default-collection-change', collectionId: string): void
}>()

const authorName = computed(
  () => props.authors?.find(({ id }) => props.book.author === id)?.name,
)

const ratingSummary = computed(() => {
  const rating = props.book.rating

  if (!rating) return 'Not rated'

  return Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1)
})

const formattedDate = computed(() => toFullDateCompact(props.book.createdAt))
</script>
