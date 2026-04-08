import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { adminPlugin } from './scripts/admin-plugin'

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    adminPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
