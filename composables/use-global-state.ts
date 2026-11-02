import { createGlobalState } from '@vueuse/core'
import { computed, ref } from 'vue'

export const useGlobalState = createGlobalState(() => {
  const { isMobile, isWide } = useBreakpoints()

  // `null` means "automatic": collapsed on phones and below `xl`, expanded on
  // wide screens. Toggling stores the user's explicit choice.
  const sidebarPreference = ref<boolean | null>(null)

  const isSidebarCollapsed = computed(() => {
    if (isMobile.value) return true
    return sidebarPreference.value ?? !isWide.value
  })

  function toggleSidebar() {
    sidebarPreference.value = !isSidebarCollapsed.value
  }

  return { isSidebarCollapsed, toggleSidebar }
})
