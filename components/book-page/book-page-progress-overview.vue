<template>
  <div class="paper flex flex-col gap-3 p-5">
    <p class="eyebrow">Reading Progress</p>

    <p
      class="text-primary text-end text-3xl leading-none font-semibold sm:text-4xl"
    >
      {{ progress }}%
    </p>

    <bl-progress-bar :progress-value="progress" size="sm" color="bg-primary" />

    <p class="text-ink-primary text-end text-sm leading-snug font-semibold">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Book, BookProgressStatus } from '~/types/book'

const props = defineProps<{
  book: Book
}>()

const currentStatus = computed(
  () => props.book.progressStatus ?? ('not-owned' as BookProgressStatus),
)

const progress = computed(() => {
  return 23 // TODO: Calculate progress based on book's reading status and pages read
})

const subtitle = computed(() => {
  const pages = props.book.pages
  if (!pages) {
    return PROGRESS_STATUS_MAP[currentStatus.value].description
  }

  const pagesRead = Math.round((pages * progress.value) / 100)
  return `${pagesRead} of ${pages} pages`
})
</script>
