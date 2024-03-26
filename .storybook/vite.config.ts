import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dirs: ['../composables'],
      vueTemplate: true,
    }),
    Components({
      dirs: ['../components/'],
      dts: true,
      directoryAsNamespace: true,
    }),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      // Add any other aliases you use in your code base
      // https://nuxt.com/docs/api/configuration/nuxt-config/#alias
    },
  },
})
