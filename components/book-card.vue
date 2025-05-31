<template>
  <div class="relative flex flex-col" v-bind="$attrs">
    <div
      v-if="draggable"
      class="relative flex w-full cursor-grab items-center gap-3 rounded-t-xl border-x border-t border-main bg-main px-4 py-1"
    >
      <span
        v-if="book.order !== undefined"
        class="w-full text-center text-lg text-white"
        >{{ book.order + 1 }}</span
      >
      <IconDirectionArrows
        class="absolute right-4 top-1/2 -translate-y-1/2 text-white"
        :size="ICON_SIZE_SMALL"
        stroke="1.5"
      />
      <div
        class="absolute -inset-x-px -bottom-4 -z-10 h-4 border-x border-main bg-main"
      />
    </div>
    <div class="relative flex flex-col items-start gap-3">
      <div
        v-if="floatingIcon"
        class="absolute right-0 top-0 z-10 flex size-6 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-main text-white"
      >
        <component :is="icons[floatingIcon]" :size="ICON_SIZE_SMALL - 4" />
      </div>
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
          <h6
            class="overflow-hidden leading-tight"
            :style="{
              display: '-webkit-box',
              '-webkit-line-clamp': 2,
              '-webkit-box-orient': 'vertical',
            }"
          >
            {{ book.title }}
          </h6>
        </NuxtLink>
        <p v-if="book.authorName" class="truncate text-accent-darker">
          {{ book.authorName }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons, IconDirectionArrows } from '@tabler/icons-vue'
import type { ViewBook } from '~/types/book'

const props = defineProps<{
  book: Pick<
    ViewBook,
    'id' | 'title' | 'coverSrc' | 'selected' | 'order' | 'authorName'
  >
  selectable?: boolean
  draggable?: boolean
  floatingIcon?: keyof typeof icons
}>()

const href = `/library/books/${props.book.id}`

const emit = defineEmits(['selected'])

function onSelect() {
  if (props.selectable) {
    emit('selected', !props.book.selected)
  }
}
</script>
