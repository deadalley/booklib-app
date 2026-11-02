<template>
  <div class="section-tile group">
    <span class="section-tile-icon" aria-hidden="true">
      <component :is="icons[icon]" :size="22" stroke="1.6" />
    </span>
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <!-- The title link is stretched over the whole card (see ::after) -->
      <NuxtLink :to="href" class="section-tile-link">
        <h5 class="section-tile-label"><slot name="label" /></h5>
      </NuxtLink>
      <p v-if="$slots['total']" class="section-tile-total">
        <slot name="total" />
      </p>
    </div>
    <div v-if="$slots['default']" class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

defineProps<{
  href: string
  icon: keyof typeof icons
}>()
</script>

<style scoped>
@reference '../assets/css/main.css';

.section-tile {
  @apply paper-flat relative flex flex-1 items-center gap-4 px-5 py-4 transition-colors duration-200 sm:py-5;
  @apply hover:border-primary/40 focus-within:border-primary/40;
}
.section-tile-icon {
  @apply bg-primary-50 text-primary rounded-scholarly grid size-10 shrink-0 place-items-center;
}
.section-tile-link {
  @apply after:absolute after:inset-0 after:content-[''] focus-visible:outline-none;
}
.section-tile-link:focus-visible::after {
  @apply ring-primary/25 rounded-scholarly ring-2;
}
.section-tile-label {
  @apply group-hover:text-primary transition-colors;
}
.section-tile-total {
  @apply text-ink-muted text-xs font-bold tracking-widest uppercase;
}
</style>
