<template>
  <PaginationRoot
    v-model:page="currentPage"
    :total="totalItemCount"
    :sibling-count="1"
    :default-page="1"
    :items-per-page="itemsPerPage"
    class="pagination-root"
    @update:page="(args) => $emit('update:page', args)"
  >
    <p class="pagination-summary">
      Page {{ currentPageDisplay }} of {{ totalPages }}
    </p>

    <PaginationList v-slot="{ items }" class="pagination-list">
      <PaginationFirst class="pagination-arrow">
        <IconChevronsLeft :size="ICON_SIZE_MEDIUM" stroke="1.5" />
      </PaginationFirst>
      <PaginationPrev class="pagination-arrow">
        <IconChevronLeft :size="ICON_SIZE_MEDIUM" stroke="1.5" />
      </PaginationPrev>
      <template v-for="(page, index) in items">
        <PaginationListItem
          v-if="page.type === 'page'"
          :key="index"
          class="pagination-page-item"
          :value="page.value"
        >
          {{ page.value }}
        </PaginationListItem>
        <PaginationEllipsis
          v-else
          :key="page.type"
          :index="index"
          class="pagination-ellipsis"
        >
          &#8230;
        </PaginationEllipsis>
      </template>
      <PaginationNext class="pagination-arrow pagination-arrow-next">
        <IconChevronRight :size="ICON_SIZE_MEDIUM" stroke="1.5" />
      </PaginationNext>
      <PaginationLast class="pagination-arrow">
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

const props = defineProps<{ totalItemCount: number; itemsPerPage: number }>()

defineEmits<{
  (e: 'update:page', val: number): void
}>()

const currentPage = defineModel<number>()

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.totalItemCount / props.itemsPerPage)),
)

const currentPageDisplay = computed(() => {
  const page = currentPage.value ?? 1
  return Math.min(page, totalPages.value)
})
</script>
