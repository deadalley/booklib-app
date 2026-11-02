import type { Config } from 'tailwindcss'
import { activeTheme, toTailwindTheme } from './utils/theme'

export default {
  content: [],
  plugins: [],
  theme: toTailwindTheme(activeTheme),
} satisfies Config
