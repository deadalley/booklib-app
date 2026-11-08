<template>
  <section class="home-card" :aria-labelledby="titleId">
    <header class="flex items-center justify-between gap-3">
      <h5 :id="titleId" class="home-card-title">
        {{ title }}
        <bl-chip
          v-if="count"
          size="sm"
          rounded
          variant="secondary"
          class="tracking-normal"
        >
          {{ count }}
        </bl-chip>
      </h5>
      <NuxtLink v-if="to" :to="to" class="link">
        {{ linkLabel }}
        <IconArrowRight :size="14" stroke="2" />
      </NuxtLink>
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'

withDefaults(
  defineProps<{
    title: string
    count?: number | null
    to?: string
    linkLabel?: string
  }>(),
  { count: null, to: undefined, linkLabel: 'View all' },
)

const titleId = useId()
</script>

<style scoped>
@reference '../assets/css/main.css';

.home-card-title {
  @apply font-body text-primary flex flex-none items-center gap-2 text-[0.8125rem] leading-[1.3] font-bold tracking-[0.12em] whitespace-nowrap uppercase;
}
</style>
