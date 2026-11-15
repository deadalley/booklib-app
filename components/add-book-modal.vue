<template>
  <bl-modal v-model="open" size="sm" sheet>
    <template #title>Add a book</template>
    <template #subtitle>How do you want to add it?</template>

    <div class="grid grid-cols-2 gap-2.5" data-testid="add-book-options">
      <bl-option-card
        v-for="option in OPTIONS"
        :key="option.title"
        layout="stack"
        size="sm"
        icon-well="square"
        :icon="option.icon"
        :title="option.title"
        :description="option.description"
        :aria-label="option.title"
        class="min-h-28"
        @click="choose(option.to)"
      />
    </div>
  </bl-modal>
</template>

<script setup lang="ts">
import type { icons } from '@tabler/icons-vue'
import type { RouteLocationRaw } from 'vue-router'

const OPTIONS: {
  title: string
  description: string
  icon: keyof typeof icons
  to: RouteLocationRaw
}[] = [
  {
    title: 'Enter manually',
    description: 'Type in the title, author and the rest',
    icon: 'IconPencil',
    to: '/library/books/new',
  },
  {
    title: 'Scan ISBN',
    description: 'Fill in the details from the barcode',
    icon: 'IconBarcode',
    to: { path: '/library/books/new', query: { scan: null } },
  },
]

const open = defineModel<boolean>({ default: false })

async function choose(to: RouteLocationRaw) {
  open.value = false
  await navigateTo(to)
}
</script>
