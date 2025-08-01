<template>
  <bl-switch v-model="view">
    <bl-switch-option
      v-if="views.includes('cards')"
      value="cards"
      :selected-value="view"
    >
      <template #icon="iconProps">
        <IconLayoutGrid v-bind="iconProps" />
      </template>
      <template #tooltip>Grid view</template>
    </bl-switch-option>
    <bl-switch-option
      v-if="views.includes('expanded-cards')"
      value="expanded-cards"
      :selected-value="view"
    >
      <template #icon="iconProps">
        <IconMist v-bind="iconProps" />
      </template>
      <template #tooltip>Expanded cars view</template>
    </bl-switch-option>
    <bl-switch-option
      v-if="views.includes('table')"
      value="table"
      :selected-value="view"
    >
      <template #icon="iconProps">
        <IconList v-bind="iconProps" />
      </template>
      <template #tooltip>Table view</template>
    </bl-switch-option>
  </bl-switch>
</template>

<script setup lang="ts">
import { IconLayoutGrid, IconMist, IconList } from '@tabler/icons-vue'
import type { View } from '~/types/ui'

withDefaults(
  defineProps<{
    views?: View[]
  }>(),
  { views: () => ['cards', 'table'] },
)

const view = defineModel<View>('view')
</script>
