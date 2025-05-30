<template>
  <bl-tile v-if="authors?.length" class="flex-1">
    <!-- <template #title><slot name="title" /></template> -->
    <div class="flex w-full flex-col items-center gap-6">
      <div class="flex w-full items-center gap-2">
        <IconChevronLeft
          class="-mx-2 cursor-pointer text-main hover:text-main/60"
          @click="index = index === authors.length - 1 ? 0 : index - 1"
        />
        <h6 class="flex-1">{{ authors[index].author.name }}</h6>
        <IconChevronRight
          class="-mx-2 cursor-pointer text-main hover:text-main/60"
          @click="index = index === authors.length - 1 ? 0 : index + 1"
        />
      </div>
      <div
        class="flex flex-col items-center rounded-2xl border border-accent bg-white px-6 py-2 text-main"
      >
        <div class="flex items-center">
          <template v-if="authors[0].average !== undefined">
            <h4>
              {{ authors[index]?.average }}
            </h4>
            <IconStar stroke="2" :size="ICON_SIZE_MEDIUM" />
          </template>
          <template v-if="authors[0].average === undefined">
            <h4>
              {{ authors[index]?.count }}
            </h4>
            <IconBooks stroke="1.5" :size="ICON_SIZE_MEDIUM + 2" />
          </template>
        </div>
        <p v-if="authors[index]?.label" class="text-accent-darker">
          {{ authors[index]?.label }}
        </p>
      </div>
    </div>
  </bl-tile>
</template>

<script setup lang="ts">
import {
  IconBooks,
  IconChevronLeft,
  IconChevronRight,
  IconStar,
} from '@tabler/icons-vue'
import type { Author } from '~/types/author'

const props = defineProps<{
  authors: {
    author: Author
    label?: string
    average?: number | undefined
    count: number
  }[]
}>()

const index = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    index.value = (index.value + 1) % props.authors.length
  }, 8 * 1_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
