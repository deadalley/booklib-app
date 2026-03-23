<template>
  <header class="border-stroke-subtle flex flex-col gap-1 border-b pb-16">
    <!-- Title -->
    <h1 class="font-body">
      {{ book.title }}
    </h1>

    <div class="flex items-center gap-6">
      <!-- Author -->
      <div class="flex items-baseline gap-3">
        <p class="text-ink-secondary font-semibold">by</p>
        <p v-if="authorName" class="text-xl font-bold tracking-wide">
          {{ authorName }}
        </p>
      </div>

      <p class="text-ink-subtle text-2xl">•</p>

      <!-- Rating -->
      <div
        class="text-ink-primary inline-flex items-center gap-1 text-lg font-semibold"
      >
        <IconStarFilled
          :size="ICON_SIZE_SMALL"
          :stroke="1.5"
          class="text-primary"
        />
        {{ ratingSummary }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { icons, IconStarFilled } from '@tabler/icons-vue'
import type { Book } from '~/types/book'

defineProps<{
  book: Book
  authorName?: string
  ratingSummary: string
}>()
</script>

<style scoped></style>
