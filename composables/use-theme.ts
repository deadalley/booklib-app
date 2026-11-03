import {
  DEFAULT_THEME_PREFERENCE,
  THEMES,
  THEME_STORAGE_KEY,
  type ThemeName,
  type ThemePreference,
} from '~/utils/theme'

const PREFERENCES: ThemePreference[] = ['system', 'light', 'dark']

const preference = ref<ThemePreference>(DEFAULT_THEME_PREFERENCE)
const systemTheme = ref<ThemeName>('light')
let initialized = false

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return PREFERENCES.includes(saved as ThemePreference)
      ? (saved as ThemePreference)
      : DEFAULT_THEME_PREFERENCE
  } catch {
    return DEFAULT_THEME_PREFERENCE
  }
}

function writePreference(value: ThemePreference) {
  try {
    if (value === DEFAULT_THEME_PREFERENCE) {
      localStorage.removeItem(THEME_STORAGE_KEY)
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, value)
    }
  } catch {
    // Storage can be unavailable (private mode); the choice lasts the session
  }
}

const theme = computed<ThemeName>(() =>
  preference.value === 'system' ? systemTheme.value : preference.value,
)

function applyTheme(name: ThemeName) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', name)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEMES[name].colors.surface.canvas)
}

function init() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  preference.value = readPreference()
  const media = window.matchMedia?.('(prefers-color-scheme: dark)')
  systemTheme.value = media?.matches ? 'dark' : 'light'
  media?.addEventListener?.('change', (event) => {
    systemTheme.value = event.matches ? 'dark' : 'light'
  })

  watch(theme, applyTheme, { immediate: true })
}

/**
 * The light/dark theme. The preference ('light' by default) is stored on
 * this device; 'system' follows the OS setting and its changes.
 */
export function useTheme() {
  init()

  function setPreference(value: ThemePreference) {
    preference.value = value
    writePreference(value)
  }

  /** Switches to the opposite of the theme currently shown. */
  function toggleTheme() {
    setPreference(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    preference: readonly(preference),
    theme,
    colors: computed(() => THEMES[theme.value].colors),
    setPreference,
    toggleTheme,
  }
}
