<template>
  <nav
    class="flex h-full flex-col gap-6 border-r border-r-accent bg-background px-6 pb-8 pt-16"
  >
    <h3 class="mb-6 cursor-pointer text-2xl font-medium tracking-wider">
      <NuxtLink to="/"> BOOKLIB </NuxtLink>
    </h3>
    <div class="flex flex-1 flex-col justify-between">
      <div class="flex flex-1 flex-col gap-3">
        <bl-nav-sidebar-button
          v-for="(button, index) in buttons"
          :key="button.label"
          :active="activeItemIndex === index"
          :to="button.to"
          :disabled="button.disabled"
        >
          <template #icon="iconProps">
            <component v-bind="iconProps" :is="button.icon" />
          </template>
          {{ button.label }}
        </bl-nav-sidebar-button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  IconBooks,
  IconHome,
  IconClockHour3,
  IconChartLine,
  IconBookUpload,
  IconBookDownload,
} from '@tabler/icons-vue'

const route = useRoute()

const { data: isEmpty } = await useFetch<number>('/api/library/is-empty')

const buttons = [
  { label: 'Home', icon: IconHome, to: '/home', disabled: false },
  {
    label: 'Library',
    icon: IconBooks,
    to: '/library',
    disabled: !!isEmpty.value,
  },
  {
    label: 'Statistics',
    icon: IconChartLine,
    to: '/stats',
    disabled: !!isEmpty.value,
  },
  {
    label: 'Tracking',
    icon: IconClockHour3,
    to: '/tracking',
    disabled: !!isEmpty.value,
  },
  { label: 'Import', icon: IconBookUpload, to: '/import', disabled: false },
  { label: 'Export', icon: IconBookDownload, to: '/export', disabled: false },
]
const activeItemIndex = computed(() =>
  buttons.findIndex(({ to }) => route.path.includes(to)),
)
</script>
