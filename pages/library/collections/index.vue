<template>
  <NuxtLayout
    name="library"
    title="All Collections"
    :total="collections?.length ?? 0"
  >
    <template #navbar>
      <NuxtLink class="flex md:inline-flex" to="/library/collections/new">
        <bl-button expand>
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Collection
        </bl-button>
      </NuxtLink>
      <bl-search-bar @input="onSearch" />

      <div class="flex gap-3">
        <bl-book-view-switch v-model:view="view" />
      </div>
    </template>
    <div
      v-if="view === 'cards'"
      class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-auto pt-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12"
    >
      <bl-collection-card
        v-for="collection in sortedCollections"
        :key="collection.id"
        :collection="collection"
      />
    </div>
    <div v-if="view === 'table'" class="overflow-x-auto">
      <bl-collections-table
        :collections="sortedCollections"
        :selected-table-columns="selectedTableColumns"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection'
import { IconPlus } from '@tabler/icons-vue'

const { data: collections } = await useFetch<Collection[]>('/api/collections')

const { view, sortedCollections, selectedTableColumns, onSearch } =
  useSortCollections(collections.value ?? [])
</script>
