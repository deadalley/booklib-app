<script setup>
import { IconLayoutDashboard, IconMist, IconTable } from '@tabler/icons-vue'

const value = ref()
</script>

<template>
  <Story title="Atom/Switch">
    <bl-switch v-model="value">
      <bl-switch-option value="cards" :selected-value="value">
        <template #icon="iconProps">
          <IconLayoutDashboard v-bind="iconProps" />
        </template>
      </bl-switch-option>
      <bl-switch-option value="expanded-cards" :selected-value="value">
        <template #icon="iconProps">
          <IconMist v-bind="iconProps" />
        </template>
      </bl-switch-option>
      <bl-switch-option value="table" :selected-value="value">
        <template #icon="iconProps">
          <IconTable v-bind="iconProps" />
        </template>
      </bl-switch-option>
    </bl-switch>
  </Story>
</template>
