<template>
  <section class="paper flex flex-col gap-6 px-6 py-4">
    <bl-multiselect class="w-full">
      <bl-multiselect-option
        v-for="item in DEFAULT_COLLECTIONS"
        :key="item"
        :value="item"
        :selected="isSelected(item)"
        @select="$emit('default-collection-change', item)"
      >
        <template #icon="iconProps">
          <component
            :is="
              icons[
                (isSelected(item)
                  ? DEFAULT_COLLECTION_ICONS_FILLED
                  : DEFAULT_COLLECTION_ICONS)[item]!!
              ]
            "
            class="text-primary"
            v-bind="iconProps"
          />
        </template>
      </bl-multiselect-option>
    </bl-multiselect>
  </section>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { Book } from '~/types/book'

const props = defineProps<{
  book: Book
}>()

defineEmits<{
  (e: 'default-collection-change', collectionId: string): void
}>()

function isSelected(collectionId: string) {
  return (props.book.collections ?? []).some(
    (id) => String(id) === String(collectionId),
  )
}
</script>

<style scoped></style>
