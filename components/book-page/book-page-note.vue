<template>
  <li class="log-item" :class="{ latest }">
    <div class="flex min-w-0 flex-1 flex-col gap-[0.1875rem]">
      <div class="flex items-baseline gap-2">
        <span class="log-date">{{ formattedDate }}</span>
        <span v-if="note.page !== undefined" class="log-page">
          p. {{ note.page }}
        </span>
      </div>
      <p v-if="note.content" class="log-text">{{ note.content }}</p>
    </div>

    <div class="log-tools">
      <bl-icon-button
        variant="tertiary"
        class="p-1!"
        aria-label="Edit entry"
        @click="emit('edit')"
      >
        <template #default="iconProps">
          <IconEdit v-bind="iconProps" />
        </template>
      </bl-icon-button>
      <bl-icon-button
        variant="tertiary"
        class="p-1!"
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
import { IconEdit, IconTrash } from '@tabler/icons-vue'
import type { BookNote } from '~/types/book'

const props = defineProps<{ note: BookNote; latest?: boolean }>()
const emit = defineEmits<{ (e: 'edit' | 'delete'): void }>()

// Log dates are calendar days stored at UTC midnight; format them in UTC so
// they don't shift to the previous day west of UTC.
const formattedDate = computed(() => toFullDateCompact(props.note.createdAt))
</script>

<style scoped>
@reference '../../assets/css/main.css';

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

.log-page {
  @apply text-primary bg-primary-100 rounded-full px-[0.4375rem] py-px text-[0.6875rem] font-bold tracking-[0.06em];
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
