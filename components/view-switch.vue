<template>
  <bl-switch v-model="_view">
    <bl-switch-option
      v-if="views.includes('cards')"
      value="cards"
      :selected-value="_view"
    >
      <template #icon="iconProps">
        <IconLayoutGrid v-bind="iconProps" />
      </template>
      <template #tooltip>Grid view</template>
    </bl-switch-option>
    <bl-switch-option
      v-if="views.includes('expanded-cards')"
      value="expanded-cards"
      :selected-value="_view"
    >
      <template #icon="iconProps">
        <IconMist v-bind="iconProps" />
      </template>
    </bl-switch-option>
    <bl-switch-option
      v-if="views.includes('table')"
      value="table"
      :selected-value="_view"
    >
      <template #icon="iconProps">
        <IconList v-bind="iconProps" />
      </template>
      <template #tooltip>Table view</template>
    </bl-switch-option>
  </bl-switch>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { IconLayoutGrid, IconMist, IconList } from '@tabler/icons-vue'
import type { View } from '~/types/ui'

const props = withDefaults(
  defineProps<{
    views?: View[]
    view: View
  }>(),
  { views: () => ['cards', 'table'] },
)

const emit = defineEmits(['update:view'])

const _view = useVModel(props, 'view', emit)
</script>
