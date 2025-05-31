<template>
  <nav
    class="hidden h-full flex-col gap-6 overflow-hidden border-r border-r-accent bg-background pb-8 pt-16 transition-all duration-500 md:flex"
    :class="{
      'px-6': !collapsed,
      'px-2': collapsed,
    }"
    :style="{ 'min-width': collapsed ? '0px' : '255px' }"
  >
    <div
      class="flex items-center"
      :class="{
        'justify-center': collapsed,
        'justify-between': !collapsed,
      }"
    >
      <h3
        class="inline-block overflow-hidden whitespace-nowrap align-middle transition-all duration-500"
        :class="{
          'pointer-events-none max-w-0 opacity-0': collapsed,
          'pointer-events-auto max-w-[200px] opacity-100': !collapsed,
        }"
      >
        <NuxtLink to="/">BOOKLIB</NuxtLink>
      </h3>
      <IconChevronLeftPipe
        class="cursor-pointer text-accent-darker transition-all duration-100 hover:text-main"
        :class="{
          'rotate-180': collapsed,
        }"
        :size="ICON_SIZE_LARGE"
        stroke="1.5"
        @click="onCollapse"
      />
    </div>
    <div class="flex flex-1 flex-col justify-between">
      <div class="flex flex-1 flex-col gap-3">
        <bl-nav-sidebar-button
          v-for="(button, index) in buttons"
          :key="button.label"
          :active="activeItemIndex === index"
          :to="button.to"
          :disabled="button.disabled"
          :icon-only="collapsed"
        >
          <template #icon="iconProps">
            <component v-bind="iconProps" :is="button.icon" />
          </template>
          <template v-if="collapsed" #tooltip>{{ button.label }}</template>
          <template #default>
            <span
              class="inline-block overflow-hidden whitespace-nowrap align-middle transition-all duration-500"
              :class="{
                'pointer-events-none max-w-0 opacity-0': collapsed,
                'pointer-events-auto max-w-[200px] opacity-100': !collapsed,
              }"
            >
              {{ button.label }}
            </span>
          </template>
        </bl-nav-sidebar-button>
      </div>
      <div class="flex flex-col gap-3">
        <bl-nav-sidebar-button
          to="/settings"
          :active="route.path.includes('settings')"
          :icon-only="collapsed"
        >
          <template #icon="iconProps">
            <IconSettings v-bind="iconProps" />
          </template>
          <template v-if="collapsed" #tooltip>Settings</template>
          <template #default>
            <span
              class="inline-block overflow-hidden whitespace-nowrap align-middle transition-all duration-500"
              :class="{
                'pointer-events-none max-w-0 opacity-0': collapsed,
                'pointer-events-auto max-w-[200px] opacity-100': !collapsed,
              }"
            >
              Settings
            </span>
          </template>
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
  IconSettings,
  IconChevronLeftPipe,
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
  {
    label: 'Export',
    icon: IconBookDownload,
    to: '/export',
    disabled: !!isEmpty.value,
  },
]

const collapsed = useState<boolean>('collapsed', () => false)

const activeItemIndex = computed(() =>
  buttons.findIndex(({ to }) => route.path.includes(to)),
)

function onCollapse() {
  collapsed.value = !collapsed.value
}
</script>
