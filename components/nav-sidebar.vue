<template>
  <nav
    class="hidden h-full flex-col gap-6 overflow-hidden border-r border-r-accent bg-background pb-8 pt-16 transition-all duration-500 md:flex"
    :class="{
      'px-6': !collapsed,
      'px-2': collapsed,
    }"
    :style="{ 'min-width': collapsed ? '0px' : '255px' }"
  >
    <h3
      class="mb-6 flex items-center"
      :class="{
        'justify-between': !collapsed,
        'justify-center': collapsed,
      }"
    >
      <NuxtLink
        v-show="!collapsed"
        class="cursor-pointer text-2xl font-medium tracking-wider"
        to="/"
      >
        BOOKLIB
      </NuxtLink>
      <component
        :is="collapsed ? IconChevronRightPipe : IconChevronLeftPipe"
        class="cursor-pointer text-accent-darker hover:text-main"
        :size="ICON_SIZE_LARGE"
        stroke="1.5"
        @click="onCollapse"
      />
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
          <template v-if="collapsed" #tooltip>{{ button.label }}</template>
          <template v-if="!collapsed" #default>
            {{ button.label }}
          </template>
        </bl-nav-sidebar-button>
      </div>
      <div class="flex flex-col gap-3">
        <bl-nav-sidebar-button to="/settings" :active="activeItemIndex === 7">
          <template #icon="iconProps">
            <IconSettings v-bind="iconProps" />
          </template>
          <template v-if="collapsed" #tooltip>Settings</template>
          <template v-if="!collapsed" #default>Settings</template>
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
  IconChevronRightPipe,
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
