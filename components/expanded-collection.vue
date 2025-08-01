<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <AccordionRoot
    :default-value="books.length ? 'items' : undefined"
    type="single"
    :collapsible="true"
    class="!w-[calc(100% - 255px)]"
  >
    <AccordionItem value="items">
      <AccordionHeader as="div" class="flex w-full">
        <AccordionTrigger
          class="accordion-trigger mb-2 flex w-full items-center justify-between rounded-2xl border border-accent px-8 py-2 text-start hover:bg-accent-light"
        >
          <div class="flex flex-1 items-center gap-3">
            <NuxtLink
              class="flex items-center gap-3"
              :to="`/library/${collectionType}/${collection.id}`"
              @click="(event: Event) => event.stopPropagation()"
            >
              <component
                :is="icons[icon]"
                v-if="icon"
                stroke="1.5"
                class="text-main"
              />
              <h5 class="hover:text-main">
                {{ collection.name }}
              </h5>
            </NuxtLink>
            <bl-total-tag>{{
              books.length
                ? `${books.length} ${books.length > 1 ? 'books' : 'book'}`
                : 'Empty'
            }}</bl-total-tag>
          </div>
          <bl-modal
            v-if="canDelete"
            ref="deleteModalRef"
            size="sm"
            @confirm="deleteCollection"
          >
            <template #trigger>
              <IconTrash
                class="mr-4 cursor-pointer text-accent-dark hover:text-main"
                :size="ICON_SIZE_SMALL"
                stroke="1.5"
                @click="openDeleteModal"
              />
            </template>
            <template #title>
              Are you sure you want to delete
              <strong class="contents">{{ collection.name }}</strong>
              ?
            </template>
            <bl-checkbox v-model="deleteBooks" align="left">
              <template v-if="!deleteBooks">
                Your books will <strong>not</strong> be deleted.
              </template>
              <template v-if="deleteBooks">
                Your books <strong>will</strong> be deleted.
              </template>
              This action cannot be undone.
            </bl-checkbox>
            <template #cancel-label> Cancel </template>
            <template #action-label> Delete </template>
          </bl-modal>
          <IconChevronDown
            class="accordion-chevron transition-transform duration-300 ease-in"
            :size="20"
          />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="relative mb-10 overflow-x-auto">
        <div
          v-if="books.length"
          class="accordion-content relative flex size-max gap-x-6 p-4 transition duration-100 ease-out"
        >
          <bl-book-card
            v-for="book in sortBooksByOrder(books)"
            :key="book.title"
            :book="book"
            class="!w-36"
          />
        </div>
        <div
          v-if="!books.length"
          class="flex w-full items-center justify-center px-4 py-8"
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

defineEmits(['delete'])

const deleteModalRef = ref()
const deleteBooks = ref(false)

const { deleteCollection: _deleteCollection, deleteAuthor } = useBookLibrary()

function openDeleteModal() {
  deleteModalRef.value.setIsOpen(true)
}

async function deleteCollection() {
  if (props.collectionType === 'collections') {
    await _deleteCollection(props.collection.id as string, deleteBooks.value)
  } else {
    await deleteAuthor(props.collection.id as string, deleteBooks.value)
  }

  navigateTo(`/library/${props.collectionType}`)
}
</script>

<style scoped>
.accordion-content {
  overflow: hidden;
}

.accordion-content[data-state='open'] {
  animation: slideDown 300ms ease-out;
}

.accordion-content[data-state='closed'] {
  animation: slideUp 300ms ease-out;
}

.accordion-chevron {
  transition: transform 300ms;
}
.accordion-trigger[data-state='open'] > .accordion-chevron {
  transform: rotate(180deg);
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
