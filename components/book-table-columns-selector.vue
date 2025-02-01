<template>
  <div class="flex flex-col gap-3">
    <h6>Columns</h6>
    <bl-list-checkbox>
      <bl-list-checkbox-option
        v-for="column in tableColumns"
        :key="column.value"
        :value="column.value"
        :checked="column.checked"
        @input="onColumnFilter"
      >
        {{ column.label }}
      </bl-list-checkbox-option>
    </bl-list-checkbox>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const selectedTableColumns = defineModel<{
  [key in keyof Book]?: { label: string; checked: boolean }
}>('selectedTableColumns', { default: {} })

const tableColumns = computed(() =>
  Object.entries(selectedTableColumns.value).map(([value, rest]) => ({
    value,
    ...rest,
  })),
)

watch(selectedTableColumns, (v) => console.log(v))

function onColumnFilter(v: Event) {
  const { value, checked } = v.target as HTMLInputElement

  const entry =
    selectedTableColumns.value[value as keyof typeof selectedTableColumns.value]

  if (entry) {
    entry.checked = checked
  }
}
</script>
