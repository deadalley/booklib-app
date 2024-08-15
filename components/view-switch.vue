<template>
  <bl-switch v-slot="switchProps" v-model="_view">
    <bl-switch-option
      v-if="views.includes('cards')"
      value="cards"
      v-bind="switchProps"
    >
      <template #icon="iconProps">
        <IconLayoutDashboard v-bind="iconProps" />
      </template>
    </bl-switch-option>
    <bl-switch-option
      v-if="views.includes('expanded-cards')"
      value="expanded-cards"
      v-bind="switchProps"
    >
      <template #icon="iconProps">
        <IconMist v-bind="iconProps" />
      </template>
    </bl-switch-option>
    <bl-switch-option
      v-if="views.includes('table')"
      value="table"
      v-bind="switchProps"
    >
      <template #icon="iconProps">
        <IconTable v-bind="iconProps" />
      </template>
    </bl-switch-option>
  </bl-switch>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { IconLayoutDashboard, IconMist, IconTable } from '@tabler/icons-vue'
import type { View } from '~/types/ui'

const props = withDefaults(
  defineProps<{
    views: View[]
    view: View
  }>(),
  { views: () => ['cards', 'table'] },
)

const emit = defineEmits(['update:view'])

const _view = useVModel(props, 'view', emit)
</script>
