<template>
  <NuxtLayout
    name="library"
    title="All Collections"
    :total="collections?.length ?? 0"
    :sidebar-content="false"
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
      <bl-search-bar @input="onSearch"></bl-search-bar>

      <div class="flex gap-3">
        <bl-switch v-slot="props" v-model="view">
          <bl-switch-option value="cards" v-bind="props">
            <template #icon="iconProps">
              <IconLayoutDashboard v-bind="iconProps" />
            </template>
          </bl-switch-option>
          <bl-switch-option value="table" v-bind="props">
            <template #icon="iconProps">
              <IconTable v-bind="iconProps" />
            </template>
          </bl-switch-option>
        </bl-switch>
      </div>
    </template>
    <div
      v-if="view === 'cards'"
      class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-auto md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12"
    ></div>
    <div v-if="view === 'table'" class="overflow-x-auto">
      <bl-collections-table
        :collections="sortedCollections"
        :selected-table-columns="selectedTableColumns"
      ></bl-collections-table>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection'
import { IconPlus, IconLayoutDashboard, IconTable } from '@tabler/icons-vue'

const route = useRoute()

const textSearch = ref()
const view = ref(route.query.view ?? 'cards')

const defaultTableColumns = {
  title: { label: 'Title', checked: true },
}

const selectedTableColumns = ref<{
  [key in keyof Collection]?: { label: string; checked: boolean }
}>(defaultTableColumns)

const collections: Collection[] = []

const sortedCollections = computed(() => {
  return collections
})

function onSearch($event: Event) {
  textSearch.value = ($event.target as any)?.value as string
}
</script>
