<template>
  <bl-modal
    :open="open"
    size="sm"
    with-close-button
    @cancel="$emit('close')"
    @confirm="$emit('close')"
  >
    <template #title>Search</template>

    <div class="flex flex-col gap-3 pt-1">
      <!-- Plain input -->
      <div class="form-inner">
        <IconSearch :size="ICON_SIZE_SMALL" class="text-ink-muted shrink-0" />
        <input
          ref="inputRef"
          v-model="searchTerm"
          class="min-w-0 flex-1"
          placeholder="Search books, collections, authors..."
        />
        <IconX
          v-if="searchTerm"
          :size="14"
          class="shrink-0 cursor-pointer"
          @click="searchTerm = ''"
        />
      </div>

      <!-- Results -->
      <div v-if="visibleGroups.length" class="search-group-list">
        <template v-for="group in visibleGroups" :key="group.label">
          <span class="select-group-label">{{ group.label }}</span>
          <NuxtLink
            v-for="option in group.options"
            :key="option.value"
            :to="option.href"
            class="search-result-row"
            @click="$emit('close')"
          >
            <bl-search-result-item :option="option" />
          </NuxtLink>
        </template>
      </div>

      <div v-else class="autocomplete-empty-item disabled">
        {{ notFoundLabel }}
      </div>
    </div>
  </bl-modal>
</template>

<script setup lang="ts">
import { IconSearch, IconX } from '@tabler/icons-vue'
import type { SearchAutocompleteGroup } from './search-bar-autocomplete.vue'

const props = defineProps<{
  open: boolean
  groups: SearchAutocompleteGroup[]
}>()

defineEmits<{ close: [] }>()

const searchTerm = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const { visibleGroups, notFoundLabel } = useSearchFilter(
  computed(() => props.groups),
  searchTerm,
)

watch(
  () => props.open,
  (open) => {
    if (open) {
      searchTerm.value = ''
      nextTick(() => inputRef.value?.focus())
    }
  },
)
</script>
