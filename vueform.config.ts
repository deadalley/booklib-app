import en from '@vueform/vueform/locales/en'
import tailwind from '@vueform/vueform/dist/tailwind'
import { defineConfig } from '@vueform/vueform'

export default defineConfig({
  classHelpers: true,
  theme: tailwind,
  locales: { en },
  locale: 'en',
})
