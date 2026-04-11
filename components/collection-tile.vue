<template>
  <NuxtLink
    :to="selectable ? undefined : collectionHref"
    class="collection-tile"
    :class="[
      { 'collection-tile-selected': selectable && collection.selected },
      { 'collection-tile-detailed': isDetailedLayout },
    ]"
  >
    <template v-if="isDetailedLayout">
      <div class="collection-tile-detailed-accent">
        <component
          :is="icons[icon]"
          v-if="icon"
          :size="ICON_SIZE_MEDIUM"
          stroke="1.5"
          :class="icon !== 'IconArchive' ? 'text-primary' : 'text-ink-muted'"
        />
        <div class="collection-tile-detailed-accent-copy">
          <p class="collection-tile-detailed-accent-label">Collection</p>
          <p class="collection-tile-detailed-accent-value">
            {{ totalBooksLabel }}
          </p>
        </div>
      </div>

      <div class="collection-tile-detailed-content">
        <NuxtLink
          class="collection-tile-detailed-title-link"
          :to="selectable ? undefined : collectionHref"
          @click="onSelect"
        >
          <h6 class="collection-tile-detailed-title">
            {{ collection.name }}
          </h6>
        </NuxtLink>

        <div class="collection-tile-detailed-main">
          <p class="collection-tile-detailed-kicker">Books</p>

          <ul
            v-if="topBooks.length"
            class="collection-tile-detailed-books-list"
          >
            <li
              v-for="book in topBooks"
              :key="book.id"
              class="collection-tile-detailed-book-item"
            >
              <NuxtImg
                v-if="book.coverSrc"
                :src="book.coverSrc"
                :alt="book.title"
                class="collection-tile-detailed-book-cover"
              />
              <bl-empty-book-image
                v-else
                :alt="book.title"
                :label="book.title!"
                :icon-size="14"
                class="collection-tile-detailed-empty-cover"
              >
                {{ book.title }}
              </bl-empty-book-image>
              <p class="collection-tile-detailed-book-title">
                {{ book.title }}
              </p>
            </li>
          </ul>

          <p v-else class="collection-tile-detailed-empty-copy">No books yet</p>
        </div>

        <NuxtLink
          v-if="hasMoreBooks && !selectable"
          :to="collectionHref"
          class="collection-tile-detailed-more-button"
        >
          See {{ remainingBooksCount }} more
        </NuxtLink>
      </div>
    </template>

    <template v-else>
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
    </template>
  </NuxtLink>
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

const props = withDefaults(
  defineProps<{
    collection: T
    collectionType: string
    selectable?: boolean
    icon?: keyof typeof icons
    layout?: 'compact' | 'detailed'
  }>(),
  {
    selectable: false,
    layout: 'compact',
    icon: 'IconArchive',
  },
)

const collectionHref = computed(
  () => `/library/${props.collectionType}/${props.collection.id}`,
)

const isDetailedLayout = computed(() => props.layout === 'detailed')

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

const topBooks = computed(() => books.value?.slice(0, 3) ?? [])

const remainingBooksCount = computed(() =>
  Math.max((props.collection.books?.length ?? 0) - 3, 0),
)

const hasMoreBooks = computed(() => remainingBooksCount.value > 0)

const totalBooksLabel = computed(() => {
  const total = props.collection.books?.length ?? 0
  return `${total} ${total === 1 ? 'book' : 'books'}`
})

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

<style scoped>
@reference '../assets/css/main.css';

.collection-tile-detailed {
  @apply min-h-40 md:min-h-0 md:flex-row;
}

.collection-tile-detailed-accent {
  @apply bg-surface flex min-w-0 items-center gap-2 px-5 py-4 md:w-52 md:flex-col md:items-start md:justify-between;
}

.collection-tile-detailed-accent-copy {
  @apply flex min-w-0 flex-col gap-1;
}

.collection-tile-detailed-accent-label {
  @apply text-ink-muted text-sm font-semibold tracking-widest uppercase;
}

.collection-tile-detailed-accent-value {
  @apply text-sm font-semibold;
}

.collection-tile-detailed-content {
  @apply flex min-w-0 flex-1 flex-col gap-4 p-5;
}

.collection-tile-detailed-title-link {
  @apply text-ink-primary hover:text-primary;
}

.collection-tile-detailed-title {
  @apply overflow-hidden text-xl leading-tight font-semibold;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.collection-tile-detailed-main {
  @apply grid gap-2 border-t border-current/10 pt-4;
}

.collection-tile-detailed-kicker {
  @apply text-ink-muted text-sm font-semibold tracking-widest uppercase;
}

.collection-tile-detailed-books-list {
  @apply grid gap-2;
}

.collection-tile-detailed-book-item {
  @apply flex min-w-0 items-center gap-2;
}

.collection-tile-detailed-book-cover {
  @apply h-9 w-7 shrink-0 rounded-sm object-cover object-center;
}

.collection-tile-detailed-empty-cover {
  @apply h-9! w-7! shrink-0 rounded-sm! p-0!;
}

.collection-tile-detailed-book-title {
  @apply text-ink-secondary truncate text-sm font-medium;
}

.collection-tile-detailed-empty-copy {
  @apply text-ink-muted text-sm;
}

.collection-tile-detailed-more-button {
  @apply border-stroke-subtle bg-surface text-ink-secondary hover:text-primary hover:border-primary rounded-scholarly mt-auto inline-flex w-fit items-center border px-3 py-1 text-sm font-semibold transition-colors;
}
</style>
