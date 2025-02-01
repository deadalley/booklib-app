<template>
  <div class="flex flex-col justify-between gap-3">
    <div class="relative flex flex-col items-start gap-3">
      <bl-book-image-small
        :alt="book.title"
        :href="href"
        :cover-src="book.coverSrc"
        :title="book.title"
        :selectable="selectable"
        :selected="book.selected"
        class="transition duration-500 ease-in-out hover:scale-110"
        @click="onSelect"
      />
      <div class="w-full flex-col">
        <NuxtLink :to="selectable ? undefined : href">
          <h5
            class="overflow-hidden leading-tight"
            :style="{
              display: '-webkit-box',
              '-webkit-line-clamp': 2,
              '-webkit-box-orient': 'vertical',
            }"
          >
            {{ book.title }}
          </h5>
        </NuxtLink>
        <h6 v-if="authorName" class="truncate">
          {{ authorName }}
        </h6>
      </div>
    </div>

    <div
      v-if="draggable"
      class="relative flex w-full cursor-grab items-center gap-3 rounded-xl border border-accent bg-accent-light px-4 py-1"
    >
      <span
        v-if="book.order !== undefined"
        class="w-full text-center text-lg text-black"
        >{{ book.order + 1 }}</span
      >
      <IconDirectionArrows
        class="absolute right-4 top-1/2 -translate-y-1/2 text-main"
        :size="ICON_SIZE_SMALL"
        stroke="1.5"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconDirectionArrows } from '@tabler/icons-vue'
import type { ViewBook } from '~/types/book'

const props = defineProps<{
  book: Pick<ViewBook, 'id' | 'title' | 'coverSrc' | 'selected' | 'order'>
  authorName?: string
  selectable?: boolean
  draggable?: boolean
}>()

const href = `/library/books/${props.book.id}`

const emit = defineEmits(['selected'])

function onSelect() {
  if (props.selectable) {
    emit('selected', !props.book.selected)
  }
}
</script>
