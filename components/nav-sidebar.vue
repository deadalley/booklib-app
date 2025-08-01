<template>
  <nav
    class="order-last flex w-full flex-col gap-6 overflow-hidden border-r border-t border-accent bg-background py-2 transition-all duration-500 sm:order-none sm:h-full sm:w-[unset] sm:border-t-0 sm:pb-8 sm:pt-16"
    :class="{
      'px-6': !collapsed,
      'items-center px-2': collapsed,
    }"
    :style="{ 'min-width': collapsed ? '0px' : '255px' }"
  >
    <img
      :src="getAssetPath('/logo.svg')"
      alt="BookLib"
      class="hidden w-6 transition-all duration-500 sm:block"
      :class="{
        'max-w-0 opacity-0': !collapsed,
        'max-w-[200px] opacity-100': collapsed,
      }"
    />
    <div
      class="hidden items-center sm:flex"
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
        <NuxtLink class="flex gap-2" to="/">
          <img :src="getAssetPath('/logo.svg')" alt="BookLib" class="w-6" />
          BOOKLIB
        </NuxtLink>
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
    <div
      class="flex flex-1 justify-center gap-3 sm:flex-col sm:justify-between"
    >
      <div
        class="flex justify-center gap-3 sm:flex-1 sm:flex-col sm:justify-start"
      >
        <bl-nav-sidebar-button
          v-for="button in buttons"
          :key="button.label"
          :active="route.path.includes(button.to)"
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
      <div class="flex gap-3 sm:flex-col">
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
import { getAssetPath } from '~/utils/assets'

const route = useRoute()

const { isLibraryEmpty } = useBookLibrary()
const isEmpty = ref<boolean>(await isLibraryEmpty())

watch(route, async () => {
  isEmpty.value = await isLibraryEmpty()
})

const buttons = computed(() => [
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
])

const { isSidebarCollapsed, toggleSidebar } = useGlobalState()
const collapsed = ref(isSidebarCollapsed)

function onCollapse() {
  toggleSidebar()
}
</script>
