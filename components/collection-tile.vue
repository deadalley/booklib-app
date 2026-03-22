<template>
  <div
    class="collection-tile"
    :class="{ 'collection-tile-selected': selectable && collection.selected }"
  >
    <NuxtLink
      :to="selectable ? undefined : collectionHref"
      class="collection-tile-cover-wrap"
      @click="onSelect"
    >
      <div v-if="books?.length" class="collection-tile-cover-grid">
        <template v-for="(book, index) in books" :key="book.id">
          <div
            class="collection-tile-cover-cell"
            :class="{
              'col-span-2': books.length === 1,
              'row-span-2':
                (books.length === 3 && index === 0) ||
                books.length === 2 ||
                books.length === 1,
            }"
          >
            <NuxtImg
              v-if="book.coverSrc"
              :src="book.coverSrc"
              :alt="book.title"
              class="collection-tile-cover"
            />
            <bl-empty-book-image
              v-else
              :alt="book.title"
              :label="book.title!"
              :icon-size="20"
              class="collection-tile-empty-cover"
            >
              {{ book.title }}
            </bl-empty-book-image>
          </div>
        </template>
      </div>
      <div v-else class="collection-tile-cover-grid">
        <bl-empty-book-image
          icon="IconArchive"
          :alt="collection.name"
          class="collection-tile-empty-state col-span-2 row-span-2"
        >
          <template #emptyLabel>No books</template>
        </bl-empty-book-image>
      </div>
    </NuxtLink>

    <div class="collection-tile-content">
      <NuxtLink
        class="collection-tile-title-row"
        :to="selectable ? undefined : collectionHref"
        @click="onSelect"
      >
        <component
          :is="icons[icon]"
          v-if="icon"
          :size="ICON_SIZE_SMALL"
          stroke="1.5"
          class="text-primary"
        />
        <h6 class="collection-tile-title">
          {{ collection.name }}
        </h6>
      </NuxtLink>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
  generic="
    ID extends string | number,
    T extends {
      id: ID
      name: string
      books: Pick<ViewBook, 'id'>[]
      selected?: boolean
    }
  "
>
import { icons } from '@tabler/icons-vue'
import type { Book, ViewBook } from '~/types/book'

const props = defineProps<{
  collection: T
  collectionType: string
  selectable?: boolean
  icon?: keyof typeof icons
}>()

const collectionHref = computed(
  () => `/library/${props.collectionType}/${props.collection.id}`,
)

const { getBook } = useBookLibrary()

const { data: books, refresh } = await useAsyncData(
  `${props.collection.id}-books`,
  async () =>
    Promise.all<Book | null>(
      props.collection.books.slice(0, 4).map(({ id }) => getBook(id)),
    ).then((books) => books.filter((book): book is Book => book !== null)),
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
