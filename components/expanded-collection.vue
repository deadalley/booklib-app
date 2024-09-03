<template>
  <Disclosure v-slot="{ open }" :default-open="true">
    <DisclosureButton
      class="mb-2 flex items-center justify-between rounded-lg px-4 py-2 text-start hover:bg-accent-light"
    >
      <div class="flex items-baseline gap-3 lg:flex-col xl:flex-row">
        <NuxtLink :to="`/library/collections/${collection.id}`">
          <h4>
            {{ collection.name }}
          </h4>
        </NuxtLink>
        <h6 class="flex gap-3 text-accent-dark">TOTAL {{ books.length }}</h6>
      </div>
      <IconChevronDown v-if="!open" :size="20" />
      <IconChevronUp v-if="open" :size="20" />
    </DisclosureButton>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform opacity-0"
      enter-to-class="transform opacity-100"
      leave-active-class="transition duration-100 ease-out"
      leave-from-class="transform opacity-100"
      leave-to-class="transform opacity-0"
    >
      <DisclosurePanel class="flex gap-x-6 overflow-x-auto p-4">
        <bl-book-card
          v-for="book in books"
          :key="book.title"
          :book="book"
          class="w-1/12"
        />
      </DisclosurePanel>
    </transition>
  </Disclosure>
</template>

<script setup lang="ts">
import { IconChevronDown, IconChevronUp } from '@tabler/icons-vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

defineProps<{ collection: Collection; books: Book[] }>()
</script>
