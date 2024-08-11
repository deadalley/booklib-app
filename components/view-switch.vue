<template>
  <bl-switch v-slot="switchProps" v-model="_view">
    <bl-switch-option value="cards" v-bind="switchProps">
      <template #icon="iconProps">
        <IconLayoutDashboard v-bind="iconProps" />
      </template>
    </bl-switch-option>
    <bl-switch-option value="table" v-bind="switchProps">
      <template #icon="iconProps">
        <IconTable v-bind="iconProps" />
      </template>
    </bl-switch-option>
  </bl-switch>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { IconLayoutDashboard, IconTable } from '@tabler/icons-vue'
import type { View } from '~/types/ui'

const props = defineProps<{
  view: View
}>()

const emit = defineEmits(['update:view'])

const _view = useVModel(props, 'view', emit)
</script>
