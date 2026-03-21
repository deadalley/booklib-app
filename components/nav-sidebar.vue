<template>
  <nav class="nav-sidebar" :data-state="collapsed ? 'collapsed' : 'expanded'">
    <img
      :src="getAssetPath('/logo.svg')"
      alt="BookLib"
      class="nav-sidebar-logo"
    />
    <div class="nav-sidebar-header">
      <h3 class="nav-sidebar-brand">
        <NuxtLink class="flex gap-2" to="/">
          <img :src="getAssetPath('/logo.svg')" alt="BookLib" class="w-6" />
          BOOKLIB
        </NuxtLink>
      </h3>
      <IconChevronLeftPipe
        class="nav-sidebar-collapse-toggle"
        :class="{
          'rotate-180': collapsed,
        }"
        :size="ICON_SIZE_LARGE"
        stroke="1.5"
        @click="onCollapse"
      />
    </div>
    <div class="nav-sidebar-content">
      <div class="nav-sidebar-links">
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
            <span class="nav-sidebar-label">
              {{ button.label }}
            </span>
          </template>
        </bl-nav-sidebar-button>
      </div>
      <div class="nav-sidebar-footer">
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
            <span class="nav-sidebar-label"> Settings </span>
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
