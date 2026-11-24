<template>
  <li class="log-item" :class="{ latest }">
    <div class="flex min-w-0 flex-1 flex-col gap-[0.1875rem]">
      <div class="flex items-baseline gap-2">
        <span class="log-date">{{ formattedDate }}</span>
        <bl-chip
          v-if="note.page !== undefined"
          size="xs"
          rounded
          variant="secondary"
        >
          p. {{ note.page }}
        </bl-chip>
      </div>
      <template v-if="note.highlight">
        <p class="log-highlight-label">
          <IconHighlight :size="13" stroke="1.8" aria-hidden="true" />
          Highlight
        </p>
        <blockquote class="log-quote">{{ note.content }}</blockquote>
        <NuxtLink
          v-if="readerHref"
          :to="readerHref"
          class="link-muted self-start text-xs"
        >
          Show in book
        </NuxtLink>
      </template>
      <p v-else-if="note.content" class="log-text">{{ note.content }}</p>
    </div>

    <div class="log-tools">
      <bl-icon-button
        variant="tertiary"
        size="sm"
        aria-label="Edit entry"
        @click="emit('edit')"
      >
        <template #default="iconProps">
          <IconEdit v-bind="iconProps" />
        </template>
      </bl-icon-button>
      <bl-icon-button
        variant="tertiary"
        size="sm"
        aria-label="Delete entry"
        @click="emit('delete')"
      >
        <template #default="iconProps">
          <IconTrash v-bind="iconProps" />
        </template>
      </bl-icon-button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { IconEdit, IconHighlight, IconTrash } from '@tabler/icons-vue'
import type { BookNote } from '~/types/book'

const props = defineProps<{
  note: BookNote
  latest?: boolean
  // Set when the book has an ebook, so highlights can open the reader
  readerBookId?: string
}>()

const readerHref = computed(() =>
  props.readerBookId && props.note.highlight
    ? `/read/${props.readerBookId}?at=${encodeURIComponent(props.note.highlight.location)}`
    : null,
)
const emit = defineEmits<{ (e: 'edit' | 'delete'): void }>()

// Log dates are calendar days stored at UTC midnight; format them in UTC so
// they don't shift to the previous day west of UTC.
const formattedDate = computed(() => toFullDateCompact(props.note.createdAt))
</script>

<style scoped>
@reference '../../assets/css/main.css';

.log-highlight-label {
  @apply text-secondary-700 flex items-center gap-1 text-[0.6875rem] font-bold tracking-widest uppercase;
}
.log-quote {
  @apply font-display text-ink-primary text-[0.9375rem] leading-snug italic;
}

.log-item {
  @apply relative flex items-start gap-2 py-2.5;
}

.log-item + .log-item {
  @apply border-stroke-subtle border-t;
}

.log-item::before {
  @apply bg-surface-elevated border-primary-300 absolute top-4 -left-[1.125rem] box-border size-[11px] rounded-full border-2;
  content: '';
}

.log-item.latest::before {
  @apply bg-primary border-primary;
}

.log-date {
  @apply text-ink-primary text-[0.8125rem] font-bold;
}

.log-text {
  @apply text-ink-secondary text-[0.8125rem] leading-[1.45] whitespace-pre-wrap;
}

.log-tools {
  @apply flex gap-0.5 opacity-0 transition-opacity duration-150;
}

.log-item:hover .log-tools,
.log-item:focus-within .log-tools {
  @apply opacity-100;
}

@media (hover: none) {
  .log-tools {
    @apply opacity-100;
  }
}
</style>
