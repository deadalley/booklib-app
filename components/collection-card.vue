<template>
  <div class="flex flex-col items-start gap-3">
    <div
      class="grid h-48 w-full cursor-pointer grid-cols-2 grid-rows-2 overflow-hidden rounded-xl !ring-1 ring-accent transition duration-300 ease-in-out hover:scale-110"
      :class="{
        '!ring-main': selectable && collection.selected,
      }"
      @click="onSelect"
    >
      <template v-for="(book, index) in books" :key="book.id">
        <NuxtLink
          :to="selectable ? undefined : `/library/collections/${collection.id}`"
          class="size-full"
          :class="{
            'col-span-2': books?.length === 1,
            'row-span-2':
              (books?.length === 3 && index === 0) ||
              books?.length === 2 ||
              books?.length === 1,
          }"
        >
          <NuxtImg
            v-if="!!book.coverSrc"
            :src="book.coverSrc ?? undefined"
            :alt="book.title"
            class="size-full object-cover object-center"
          />
          <bl-empty-book-image
            v-if="!book.coverSrc"
            :alt="book.title"
            :label="book.title!"
            :icon-size="20"
            class="!rounded-none !p-2 !text-xs"
          >
            {{ book.title }}
          </bl-empty-book-image>
        </NuxtLink>
      </template>
      <bl-book-image-small
        v-if="!books?.length"
        :href="selectable ? undefined : `/library/collections/${collection.id}`"
        :alt="collection.name"
        icon="IconArchive"
        class="col-span-2 row-span-2"
      >
        <template #emptyLabel>No books</template>
      </bl-book-image-small>
    </div>
    <div class="w-full flex-col">
      <NuxtLink
        class="flex items-center gap-1"
        :to="selectable ? undefined : `/library/collections/${collection.id}`"
      >
        <component
          :is="icons[icon]"
          v-if="icon"
          :size="ICON_SIZE_SMALL"
          stroke="1.5"
          class="text-main"
        />
        <h6
          class="overflow-hidden"
          :style="{
            display: '-webkit-box',
            '-webkit-line-clamp': 2,
            '-webkit-box-orient': 'vertical',
          }"
        >
          {{ collection.name }}
        </h6>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

const props = defineProps<{
  collection: Collection & { selected?: boolean }
  selectable?: boolean
  icon?: keyof typeof icons
}>()

const { data: books, refresh } = await useAsyncData(
  `${props.collection.id}-books`,
  async () =>
    Promise.all<Book>(
      props.collection.books
        .slice(0, 4)
        // @ts-expect-error throws depth error
        .map(({ id }) => $fetch(`/api/books/${id}`)),
    ),
  {
    lazy: true,
    immediate: true,
    watch: [props.collection.books],
    transform: (books) =>
      books.map(({ id, title, coverSrc }) => ({ id, title, coverSrc })),
  },
)

onMounted(refresh)

const emit = defineEmits(['select'])

function onSelect() {
  if (props.selectable) {
    emit('select', {
      collectionId: props.collection.id,
      selected: !props.collection.selected,
    })
  }
}
</script>
