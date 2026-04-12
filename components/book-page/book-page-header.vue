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
import type { Book } from '~/types/book'

defineProps<{
  book: Book
  authorName?: string
  ratingSummary: string
  formattedDate?: string
}>()
</script>

<style scoped></style>
