<template>
  <div
    class="tracking-caps flex items-center gap-2 text-xs font-semibold uppercase"
  >
    <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
      <span v-if="index > 0" class="text-ink-muted">
        <IconChevronRight :size="13" />
      </span>
      <component
        :is="NuxtLink"
        v-if="item.to && index < items.length - 1"
        :to="item.to"
        :class="['text-ink-muted hover:text-primary transition-colors']"
      >
        {{ item.label }}
      </component>
      <span
        v-else
        :class="[
          index === items.length - 1
            ? 'text-primary font-bold'
            : 'text-ink-muted',
        ]"
      >
        {{ item.label }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { IconChevronRight } from '@tabler/icons-vue'
import { NuxtLink } from '#components'

defineProps<{
  items: Array<{
    label: string
    to?: string
  }>
}>()
</script>
