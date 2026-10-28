<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <AccordionRoot v-model="openValue" type="single" :collapsible="true">
    <AccordionItem value="items" class="border-stroke border-b">
      <AccordionHeader as="div" class="flex w-full">
        <AccordionTrigger
          class="group flex w-full cursor-pointer items-center gap-3 py-3 text-start"
        >
          <IconChevronDown
            class="text-ink-muted group-hover:text-primary shrink-0 transition-transform duration-300 ease-in group-data-[state=open]:rotate-180"
            :size="16"
            stroke="2"
          />
          <component
            :is="icons[icon]"
            v-if="icon"
            stroke="1.5"
            class="text-primary shrink-0"
            :size="18"
          />
          <NuxtLink
            :to="`/library/${collectionType}/${collection.id}`"
            class="text-ink-primary group-hover:text-primary hover:text-primary font-semibold underline-offset-[3px] hover:underline"
            @click="(event: Event) => event.stopPropagation()"
          >
            <h6>
              {{ collection.name }}
            </h6>
          </NuxtLink>
          <bl-total-tag>{{ bookCountLabel }}</bl-total-tag>
          <div
            class="ml-auto flex items-center gap-4"
            @click="(event: Event) => event.stopPropagation()"
          >
            <NuxtLink
              v-if="open"
              :to="`/library/${collectionType}/${collection.id}`"
              class="text-primary text-xs font-bold tracking-widest uppercase"
            >
              See All
            </NuxtLink>
            <button
              v-else
              type="button"
              class="text-ink-muted hover:text-primary cursor-pointer text-xs font-bold tracking-widest uppercase"
              @click="open = true"
            >
              Expand
            </button>
            <bl-delete-collection-modal
              v-if="canDelete"
              :name="collection.name"
              @confirm="
                (deleteBooks) => $emit('delete', collection.id, deleteBooks)
              "
            >
              <template #trigger>
                <IconTrash
                  class="text-ink-muted hover:text-primary cursor-pointer"
                  :size="ICON_SIZE_SMALL"
                  stroke="1.5"
                />
              </template>
            </bl-delete-collection-modal>
          </div>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content">
        <div
          v-if="books.length"
          class="flex size-max gap-x-6 py-4 pl-7 transition duration-100 ease-out"
        >
          <div
            v-for="book in sortBooksByOrder(books)"
            :key="book.title"
            class="w-40 shrink-0 [&>div]:h-full"
          >
            <bl-book-tile :book="book" />
          </div>
        </div>
        <div
          v-if="!books.length"
          class="text-ink-muted flex w-full items-center justify-center px-4 py-8 text-sm"
        >
          There are no books in this collection.
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>

<script
  setup
  lang="ts"
  generic="
    ID extends string | number,
    T extends {
      id: ID
      name: string
      selected?: boolean
    }
  "
>
import { IconChevronDown, icons, IconTrash } from '@tabler/icons-vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'radix-vue'
import type { Book } from '~/types/book'

const props = defineProps<{
  collectionType: 'authors' | 'collections'
  collection: T
  books: Book[]
  canDelete?: boolean
  icon?: keyof typeof icons
}>()

defineEmits<{ (e: 'delete', id: T['id'], deleteBooks: boolean): void }>()

const open = defineModel<boolean>('open', { default: true })

const openValue = computed({
  get: () => (open.value ? 'items' : undefined),
  set: (val) => {
    open.value = val === 'items'
  },
})

const bookCountLabel = computed(() =>
  props.books.length
    ? `${props.books.length} ${props.books.length > 1 ? 'books' : 'book'}`
    : 'Empty',
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.accordion-content {
  @apply overflow-x-auto;
}
.accordion-content[data-state='open'] {
  animation: slideDown 300ms ease-out;
}
.accordion-content[data-state='closed'] {
  animation: slideUp 300ms ease-out;
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}
</style>
