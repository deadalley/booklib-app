<script setup>
import { IconLayoutDashboard, IconMist, IconTable } from '@tabler/icons-vue'
</script>

<template>
  <Story title="Molecules/Switch">
    <bl-switch v-slot="switchProps" v-model="_view">
      <bl-switch-option value="cards" v-bind="switchProps">
        <template #icon="iconProps">
          <IconLayoutDashboard v-bind="iconProps" />
        </template>
      </bl-switch-option>
      <bl-switch-option value="expanded-cards" v-bind="switchProps">
        <template #icon="iconProps">
          <IconMist v-bind="iconProps" />
        </template>
      </bl-switch-option>
      <bl-switch-option value="table" v-bind="switchProps">
        <template #icon="iconProps">
          <IconTable v-bind="iconProps" />
        </template>
      </bl-switch-option>
    </bl-switch>
  </Story>
</template>
