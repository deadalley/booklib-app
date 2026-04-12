<template>
  <section class="paper flex flex-col gap-6 px-6 py-4">
    <bl-multiselect class="w-full">
      <bl-multiselect-option
        v-for="item in DEFAULT_COLLECTIONS"
        :key="item"
        :value="item"
        :selected="!!selectedDefaultCollections[item]"
        @select="$emit('default-collection-change', item)"
      >
        <template #icon="iconProps">
          <component
            :is="
              icons[
                (selectedDefaultCollections[item]
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

defineProps<{
  selectedDefaultCollections: Record<string, boolean>
}>()

defineEmits<{
  (e: 'default-collection-change', collectionId: string): void
}>()
</script>

<style scoped></style>
