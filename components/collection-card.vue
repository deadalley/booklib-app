<template>
  <div class="flex flex-col items-start gap-3">
    <div
      class="grid h-48 w-full cursor-pointer grid-cols-2 grid-rows-2 overflow-hidden rounded-xl transition duration-300 ease-in-out hover:scale-110"
      :class="{
        '!ring-2 !ring-main': selectable && collection.selected,
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
          />
        </NuxtLink>
      </template>
      <bl-book-image-small
        v-if="!books?.length"
        :href="selectable ? undefined : `/library/collections/${collection.id}`"
        :alt="collection.name"
        class="col-span-2 row-span-2"
      />
    </div>
    <div class="w-full flex-col">
      <NuxtLink
        :to="selectable ? undefined : `/library/collections/${collection.id}`"
      >
        <h5
          class="overflow-hidden"
          :style="{
            display: '-webkit-box',
            '-webkit-line-clamp': 2,
            '-webkit-box-orient': 'vertical',
          }"
        >
          {{ collection.name }}
        </h5>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

const props = defineProps<{
  collection: Collection & { selected?: boolean }
  selectable?: boolean
}>()

const { data: books, refresh } = await useAsyncData(
  `${props.collection.id}-books`,
  async () =>
    Promise.all<Book>(
      props.collection.books
        .slice(0, 4)
        .map((id) => $fetch(`/api/books/${id}`)),
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
