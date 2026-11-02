<template>
  <nav class="links" aria-label="Library">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="lib-card"
    >
      <span class="home-icon-well">
        <component :is="link.icon" :size="20" stroke="1.6" />
      </span>
      <span class="text">
        <span class="count">{{ link.count }}</span>
        <span class="text-ink-primary font-bold">{{ link.label }}</span>
        <span class="sub">{{ link.sub }}</span>
      </span>
      <IconChevronRight :size="18" stroke="2" class="chevron" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import {
  IconBooks,
  IconChevronRight,
  IconFeather,
  IconStack2,
} from '@tabler/icons-vue'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import { DEFAULT_COLLECTIONS } from '~/utils/constants'

const props = defineProps<{ books: Book[]; collections: Collection[] }>()

const links = computed(() => {
  const reading = props.books.filter(
    ({ progress }) => progress.status === 'reading',
  ).length
  const own = props.collections.filter(
    ({ id }) => !DEFAULT_COLLECTIONS.includes(id),
  ).length
  const authors = new Set(
    props.books.map(({ author }) => author).filter(Boolean),
  ).size

  return [
    {
      to: '/library/books',
      icon: IconBooks,
      label: 'Books',
      count: props.books.length,
      sub: `${reading} reading now`,
    },
    {
      to: '/library/collections',
      icon: IconStack2,
      label: 'Collections',
      count: props.collections.length,
      sub: `${own} of your own`,
    },
    {
      to: '/library/authors',
      icon: IconFeather,
      label: 'Authors',
      count: authors,
      sub: 'in your library',
    },
  ]
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.links {
  @apply grid grid-cols-[minmax(0,1fr)] gap-3;
}
@container (min-width: 560px) and (max-width: 899px) {
  .links {
    @apply grid-cols-3;
  }
}
.lib-card {
  @apply bg-surface-elevated border-stroke-subtle flex items-center gap-3.5 rounded-xl border px-4.5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)];
  transition:
    border-color 0.15s,
    transform 0.15s;
}
.lib-card:hover {
  @apply border-primary-200 -translate-y-px;
}
.text {
  @apply grid min-w-0 flex-1 grid-cols-[auto_1fr] items-baseline gap-x-2;
}
.count {
  @apply font-display text-ink-primary text-[1.625rem] leading-[1.1] font-semibold;
}
.sub {
  @apply text-ink-muted col-span-full truncate text-[0.8125rem] font-medium;
}
.chevron {
  @apply text-ink-subtle flex-none;
}
.lib-card:hover .chevron {
  @apply text-primary;
}
</style>
