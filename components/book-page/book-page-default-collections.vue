<template>
  <div class="flex flex-wrap gap-2">
    <bl-button
      v-for="item in DEFAULT_COLLECTIONS"
      :key="item"
      variant="secondary"
      :pressed="!!selected[item]"
      @click="$emit('default-collection-change', item)"
    >
      <template #prependIcon>
        <component
          :is="
            icons[
              ((selected[item]
                ? DEFAULT_COLLECTION_ICONS_FILLED
                : DEFAULT_COLLECTION_ICONS)[item] ??
                'IconHeart') as keyof typeof icons
            ]
          "
          :size="18"
          stroke="1.6"
        />
      </template>
      {{ selected[item] ? LABELS[item]?.on : LABELS[item]?.off }}
    </bl-button>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

defineProps<{
  selected: Record<string, boolean>
}>()

defineEmits<{
  (e: 'default-collection-change', collectionId: string): void
}>()

const DEFAULT_COLLECTION_ICONS: Record<string, keyof typeof icons> = {
  [FAVORITE_COLLECTION_ID]: 'IconHeart',
  [TBR_COLLECTION_ID]: 'IconBook',
}

const DEFAULT_COLLECTION_ICONS_FILLED: Record<string, keyof typeof icons> = {
  [FAVORITE_COLLECTION_ID]: 'IconHeartFilled',
  [TBR_COLLECTION_ID]: 'IconBookFilled',
}

const LABELS: Record<string, { on: string; off: string }> = {
  [FAVORITE_COLLECTION_ID]: { on: 'Favorited', off: 'Favorite' },
  [TBR_COLLECTION_ID]: { on: 'In To Be Read', off: 'To Be Read' },
}
</script>
