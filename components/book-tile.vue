<template>
  <div>
    <div class="book-tile" v-bind="$attrs">
      <div v-if="draggable" class="book-tile-drag-handle">
        <span v-if="book.order !== undefined" class="book-tile-drag-order">
          {{ book.order + 1 }}
        </span>
        <IconDirectionArrows :size="ICON_SIZE_SMALL" stroke="1.5" />
      </div>

      <NuxtLink
        :to="selectable ? undefined : href"
        class="book-tile-cover-wrap"
        @click="onSelect"
      >
        <NuxtImg
          v-if="book.coverSrc"
          :src="book.coverSrc"
          :alt="book.title"
          class="book-tile-cover"
        />
        <bl-empty-book-image
          v-else
          class="book-tile-cover h-56! rounded-b-none! p-5!"
        >
          {{ book.title }}
        </bl-empty-book-image>

        <span v-if="floatingIcon" class="book-tile-floating-icon">
          <component :is="icons[floatingIcon]" :size="14" stroke="1.75" />
        </span>

        <span class="book-tile-status" :class="statusClass">
          {{ statusLabel }}
        </span>

        <span
          v-if="selectable && book.selected"
          class="book-tile-selected-badge"
        >
          <IconCheck :size="14" stroke="2" />
        </span>
      </NuxtLink>

      <div class="book-tile-content">
        <div class="book-tile-header">
          <NuxtLink :to="selectable ? undefined : href" @click="onSelect">
            <h6 class="book-tile-title">{{ book.title }}</h6>
          </NuxtLink>
          <p class="book-tile-author">
            {{ book.authorName ?? 'Unknown author' }}
          </p>
        </div>

        <div class="book-tile-meta">
          <p class="book-tile-rating">
            <IconStarFilled :size="13" class="text-primary" />
            {{ ratingLabel }}
          </p>
          <p class="book-tile-genre">{{ genreLabel }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconCheck,
  IconDirectionArrows,
  IconStarFilled,
  icons,
} from '@tabler/icons-vue'
import type { ViewBook } from '~/types/book'

const props = defineProps<{
  book: Pick<
    ViewBook,
    | 'id'
    | 'title'
    | 'coverSrc'
    | 'selected'
    | 'order'
    | 'authorName'
    | 'progressStatus'
    | 'rating'
    | 'genres'
  >
  selectable?: boolean
  draggable?: boolean
  floatingIcon?: keyof typeof icons
}>()

const emit = defineEmits(['selected'])

const href = computed(() => `/library/books/${props.book.id}`)

const statusLabel = computed(() => {
  switch (props.book.progressStatus) {
    case 'read':
      return 'Completed'
    case 'reading':
      return 'Reading'
    default:
      return 'To Read'
  }
})

const statusClass = computed(() => {
  switch (props.book.progressStatus) {
    case 'read':
      return 'book-tile-status-completed'
    case 'reading':
      return 'book-tile-status-reading'
    default:
      return 'book-tile-status-to-read'
  }
})

const ratingLabel = computed(() => {
  if (typeof props.book.rating === 'number') {
    return props.book.rating.toFixed(1)
  }

  return '--'
})

const genreLabel = computed(() => props.book.genres?.[0] ?? 'Uncategorized')

function onSelect() {
  if (props.selectable) {
    emit('selected', !props.book.selected)
  }
}
</script>
