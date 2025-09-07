import { createGlobalState } from '@vueuse/core'
import { computed, shallowRef } from 'vue'

export const useGlobalState = createGlobalState(() => {
  // state
  const state = shallowRef({
    sidebarCollapsed: false,
  })

  // getters
  const isSidebarCollapsed = computed(() => state.value.sidebarCollapsed)

  // actions
  function toggleSidebar() {
    state.value = {
      ...state.value,
      sidebarCollapsed: !state.value.sidebarCollapsed,
    }
  }

  onMounted(() => {
    if (isMobile()) {
      state.value = {
        ...state.value,
        sidebarCollapsed: true,
      }
    }
  })

  return { isSidebarCollapsed, toggleSidebar }
})
