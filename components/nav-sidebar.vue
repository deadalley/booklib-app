<template>
  <nav class="nav-sidebar" :data-state="collapsed ? 'collapsed' : 'expanded'">
    <button
      type="button"
      class="nav-sidebar-collapse-toggle"
      :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="onCollapse"
    >
      <IconChevronLeftPipe
        class="nav-sidebar-collapse-icon"
        :size="ICON_SIZE_LARGE"
        stroke="1.5"
      />
    </button>
    <div class="nav-sidebar-header">
      <img
        v-if="collapsed"
        :src="getAssetPath('/logo.svg')"
        alt="BookLib"
        class="nav-sidebar-logo"
      />
      <h2 class="nav-sidebar-brand">
        <NuxtLink class="nav-sidebar-brand-link" to="/">
          <img
            :src="getAssetPath('/logo.svg')"
            alt="BookLib"
            class="nav-sidebar-brand-mark size-10"
          />
          BOOKLIB
        </NuxtLink>
      </h2>
    </div>

    <div class="nav-sidebar-content">
      <div class="nav-sidebar-links">
        <template v-for="button in buttons" :key="button.label">
          <div v-if="button.children" class="nav-sidebar-group">
            <bl-nav-sidebar-button
              :active="collapsed && isInGroup(button)"
              :parent="!collapsed && isInGroup(button)"
              :to="button.to"
              :disabled="button.disabled"
              :icon-only="collapsed"
            >
              <template #icon="iconProps">
                <component v-bind="iconProps" :is="button.icon" />
              </template>
              <template v-if="collapsed" #tooltip>{{ button.label }}</template>
              <template #default>
                <span class="nav-sidebar-label">{{ button.label }}</span>
              </template>
            </bl-nav-sidebar-button>
            <div
              v-if="!collapsed"
              class="nav-sidebar-sub"
              role="group"
              :aria-label="button.label"
            >
              <bl-nav-sidebar-button
                v-for="child in button.children"
                :key="child.label"
                sub
                :active="isChildActive(child)"
                :to="child.to"
                :disabled="button.disabled"
              >
                <template #icon="iconProps">
                  <component v-bind="iconProps" :is="child.icon" />
                </template>
                <template #default>
                  <span class="nav-sidebar-label">{{ child.label }}</span>
                </template>
              </bl-nav-sidebar-button>
            </div>
          </div>
          <bl-nav-sidebar-button
            v-else
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
              <span class="nav-sidebar-label">{{ button.label }}</span>
            </template>
          </bl-nav-sidebar-button>
        </template>
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
            <span class="nav-sidebar-label">Settings</span>
          </template>
        </bl-nav-sidebar-button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import {
  IconBook,
  IconBooks,
  IconCalendar,
  IconFeather,
  IconStack2,
  IconHome,
  IconClockHour3,
  IconChartLine,
  IconDatabaseImport,
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

interface NavChild {
  label: string
  icon: Component
  to: string
  match?: string
  exact?: boolean
}
interface NavButton {
  label: string
  icon: Component
  to: string
  disabled: boolean
  match?: string
  children?: NavChild[]
}

const buttons = computed<NavButton[]>(() => [
  { label: 'Home', icon: IconHome, to: '/home', disabled: false },
  {
    label: 'Library',
    icon: IconBooks,
    to: '/library/books',
    match: '/library',
    disabled: !!isEmpty.value,
    children: [
      { label: 'Books', icon: IconBook, to: '/library/books' },
      { label: 'Collections', icon: IconStack2, to: '/library/collections' },
      { label: 'Authors', icon: IconFeather, to: '/library/authors' },
    ],
  },
  {
    label: 'Statistics',
    icon: IconChartLine,
    to: '/stats',
    disabled: !!isEmpty.value,
    children: [
      { label: 'Overview', icon: IconChartLine, to: '/stats', exact: true },
      {
        label: 'Year in Review',
        icon: IconCalendar,
        to: `/stats/year/${getCurrentYear()}`,
        match: '/stats/year',
      },
    ],
  },
  {
    label: 'Tracking',
    icon: IconClockHour3,
    to: '/tracking',
    disabled: !!isEmpty.value,
  },
  {
    label: 'Data',
    icon: IconDatabaseImport,
    to: '/data-management',
    disabled: false,
  },
])

const isInGroup = (button: NavButton) =>
  route.path.startsWith(button.match ?? button.to)

const isChildActive = (child: NavChild) =>
  child.exact
    ? route.path === child.to
    : route.path.startsWith(child.match ?? child.to)

const { isSidebarCollapsed, toggleSidebar } = useGlobalState()
const collapsed = ref(isSidebarCollapsed)

function onCollapse() {
  toggleSidebar()
}
</script>
