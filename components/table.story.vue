<script setup>
import { createColumnHelper } from '@tanstack/vue-table'

const columnHelper = createColumnHelper()

const cell = (info) => info.getValue()

const state = reactive({
  columns: [
    columnHelper.accessor('title', {
      header: 'Title',
      cell,
    }),
    columnHelper.accessor('author', {
      header: 'Author',
      cell,
    }),
    columnHelper.accessor('pages', {
      header: 'Pages',
      cell,
    }),
  ],
  data: [
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
    { title: 'Book 1', author: 'Author 1', pages: 233 },
  ],
})
</script>

<template>
  <Story title="Molecules/Table">
    <div class="w-full">
      <bl-table
        :data="state.data"
        :columns="state.columns"
        :on-row-click="() => {}"
      />
    </div>
  </Story>
</template>
