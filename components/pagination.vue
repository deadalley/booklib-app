<template>
  <PaginationRoot
    v-model:page="currentPage"
    show-edges
    :total="totalItemCount"
    :sibling-count="1"
    :default-page="1"
    :items-per-page="itemsPerPage"
    @update:page="(args) => $emit('update:page', args)"
  >
    <PaginationList v-slot="{ items }" class="flex items-center gap-3">
      <PaginationFirst
        class="flex size-9 items-center justify-center rounded-full text-accent-darker enabled:hover:text-main disabled:opacity-50"
      >
        <IconChevronsLeft :size="ICON_SIZE_MEDIUM" stroke="1.5" />
      </PaginationFirst>
      <PaginationPrev
        class="mr-4 flex size-9 items-center justify-center rounded-full text-accent-darker enabled:hover:text-main disabled:opacity-50"
      >
        <IconChevronLeft :size="ICON_SIZE_MEDIUM" stroke="1.5" />
      </PaginationPrev>
      <template v-for="(page, index) in items">
        <PaginationListItem
          v-if="page.type === 'page'"
          :key="index"
          class="size-10 rounded-full border border-accent bg-white text-lg text-accent-darker transition-all first:rounded-l-xl last:rounded-r-xl hover:bg-accent-light data-[selected]:border-main data-[selected]:bg-main data-[selected]:text-white"
          :value="page.value"
        >
          {{ page.value }}
        </PaginationListItem>
        <PaginationEllipsis
          v-else
          :key="page.type"
          :index="index"
          class="flex size-9 items-center justify-center text-accent-darker enabled:hover:text-main"
        >
          &#8230;
        </PaginationEllipsis>
      </template>
      <PaginationNext
        class="ml-4 flex size-9 items-center justify-center rounded-full text-accent-darker enabled:hover:text-main disabled:opacity-50"
      >
        <IconChevronRight :size="ICON_SIZE_MEDIUM" stroke="1.5" />
      </PaginationNext>
      <PaginationLast
        class="flex size-9 items-center justify-center rounded-full text-accent-darker enabled:hover:text-main disabled:opacity-50"
      >
        <IconChevronsRight :size="ICON_SIZE_MEDIUM" stroke="1.5" />
      </PaginationLast>
    </PaginationList>
  </PaginationRoot>
</template>

<script setup lang="ts">
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-vue'
import {
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'radix-vue'

defineProps<{ totalItemCount: number; itemsPerPage: number }>()

defineEmits<{
  (e: 'update:page', val: number): void
}>()

const currentPage = defineModel<number>()
</script>
