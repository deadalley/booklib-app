<template>
  <div class="flex w-full items-center gap-3">
    <NuxtImg
      v-if="option.imageSrc"
      :src="option.imageSrc"
      :alt="option.label"
      class="border-stroke size-8 shrink-0 rounded-md border object-cover"
    />
    <div
      v-else
      class="border-stroke bg-surface-subtle text-ink-secondary flex size-8 shrink-0 items-center justify-center rounded-md border"
    >
      <component :is="icon" :size="16" stroke="1.75" />
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <span class="truncate">{{ option.label }}</span>
      <span v-if="option.subtitle" class="text-ink-secondary truncate text-xs">
        {{ option.subtitle }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconArchive, IconBooks, IconUser } from '@tabler/icons-vue'
import type { SearchAutocompleteOption } from './search-bar-autocomplete.vue'

const props = defineProps<{ option: SearchAutocompleteOption }>()

const icon = computed(() => {
  switch (props.option.group) {
    case 'collections':
      return IconArchive
    case 'authors':
      return IconUser
    default:
      return IconBooks
  }
})
</script>
