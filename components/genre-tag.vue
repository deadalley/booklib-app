<template>
  <bl-chip
    rounded
    class="genre-tag"
    :class="{ 'genre-tag-removable': removable, 'genre-tag-sm': size === 'sm' }"
    data-testid="genre-tag"
  >
    <IconTag
      v-if="withIcon"
      :size="size === 'sm' ? 12 : 14"
      stroke="1.75"
      class="text-ink-muted shrink-0"
      aria-hidden="true"
    />
    <span class="truncate">
      <slot>{{ genre }}</slot>
    </span>
    <button
      v-if="removable"
      type="button"
      class="genre-tag-remove"
      :aria-label="`Remove ${genre}`"
      @click.stop.prevent="$emit('remove')"
    >
      <IconX :size="12" stroke="2" />
    </button>
  </bl-chip>
</template>

<script setup lang="ts">
import { IconTag, IconX } from '@tabler/icons-vue'

/**
 * A genre (or any other free-text tag), optionally removable. Used on the
 * book page, in the genre editor and for multi-value autocomplete fields.
 */
withDefaults(
  defineProps<{
    genre: string
    removable?: boolean
    withIcon?: boolean
    size?: 'sm' | 'md'
  }>(),
  { removable: false, withIcon: false, size: 'md' },
)

defineEmits<{ (e: 'remove'): void }>()
</script>

<style scoped>
@reference '../assets/css/main.css';

.genre-tag {
  @apply max-w-full gap-1.5;
}
.genre-tag-removable {
  @apply pr-1.5;
}
.genre-tag-sm {
  @apply px-2 py-0.5 text-xs;
}
.genre-tag-remove {
  @apply text-ink-muted hover:bg-stroke hover:text-ink-primary inline-flex shrink-0 cursor-pointer rounded-full p-0.5 transition-colors;
  @apply focus-visible:ring-primary/25 focus-visible:ring-2 focus-visible:outline-none;
}
</style>
