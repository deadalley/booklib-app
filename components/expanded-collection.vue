<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <AccordionRoot
    default-value="items"
    type="single"
    :collapsible="true"
    class="!w-[calc(100% - 255px)]"
  >
    <AccordionItem value="items">
      <AccordionHeader as="div" class="flex w-full">
        <AccordionTrigger
          class="accordion-trigger mb-2 flex w-full items-center justify-between rounded-xl px-4 py-2 text-start hover:bg-accent-light"
        >
          <div class="flex flex-1 items-center gap-3 md:flex-col lg:flex-row">
            <NuxtLink
              :to="`/library/collections/${collection.id}`"
              @click="(event: Event) => event.stopPropagation()"
            >
              <h4 class="hover:text-main">
                {{ collection.name }}
              </h4>
            </NuxtLink>
            <bl-total-tag>{{
              books.length ? `${books.length} books` : 'Empty'
            }}</bl-total-tag>
          </div>
          <IconChevronDown
            class="accordion-chevron transition-transform duration-300 ease-in"
            :size="20"
          />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="relative overflow-x-auto">
        <div
          class="accordion-content relative flex size-max gap-x-6 p-4 transition duration-100 ease-out"
        >
          <bl-book-card
            v-for="book in sortBooks(books)"
            :key="book.title"
            :book="book"
            class="!w-36"
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>

<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'radix-vue'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

defineProps<{ collection: Collection; books: Book[] }>()
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
