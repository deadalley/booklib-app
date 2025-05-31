<template>
  <bl-tile v-if="authors?.length" class="flex-1">
    <!-- <template #title><slot name="title" /></template> -->
    <div class="flex w-full flex-col items-center gap-6">
      <div class="flex w-full items-center justify-between gap-2">
        <IconChevronLeft
          class="-mx-2 cursor-pointer text-main hover:text-main/60"
          :size="ICON_SIZE_SMALL"
          @click="onClickBack"
        />
        <h6 class="text-center">{{ authors[index].author.name }}</h6>
        <IconChevronRight
          class="-mx-2 cursor-pointer text-main hover:text-main/60"
          :size="ICON_SIZE_SMALL"
          @click="onClickForward"
        />
      </div>
      <div
        v-if="
          authors[index]?.average !== undefined ||
          authors[index]?.countByStatus === undefined
        "
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
      <div v-if="authors[index]?.countByStatus" class="flex gap-2">
        <div
          v-for="[status, count] in Object.entries(
            authors[index].countByStatus ?? {},
          )
            .filter(([, count]) => count > 0)
            .slice(0, 2)"
          :key="status"
          class="flex flex-col items-center rounded-2xl border border-accent bg-white px-6 py-2 text-main"
        >
          <div class="flex items-center">
            <h4>
              {{ count }}
            </h4>
            <component
              :is="
                icons[PROGRESS_STATUS_MAP[status as BookProgressStatus].icon]
              "
              :size="ICON_SIZE_MEDIUM"
              stroke="2"
            />
          </div>
          <p class="text-accent-darker">
            {{ PROGRESS_STATUS_MAP[status as BookProgressStatus].description }}
          </p>
        </div>
      </div>
    </div>
  </bl-tile>
</template>

<script setup lang="ts">
import {
  IconBooks,
  IconChevronLeft,
  IconChevronRight,
  icons,
  IconStar,
} from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { BookProgressStatus } from '~/types/book'

const props = defineProps<{
  authors: {
    author: Author
    label?: string
    average?: number | undefined
    count: number
    countByStatus?: Record<BookProgressStatus, number>
  }[]
}>()

const interacted = ref(false)

const { index, resetTimer } = useAutoIncrementIndex(props.authors.length, 8)

function onClickBack() {
  index.value = index.value === 0 ? props.authors.length - 1 : index.value - 1
  if (!interacted.value) resetTimer(20)
  interacted.value = true
}

function onClickForward() {
  index.value = index.value === props.authors.length - 1 ? 0 : index.value + 1
  if (!interacted.value) resetTimer(20)
  interacted.value = true
}
</script>
