import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-multi-date-picker') || id.includes('react-date-object')) return 'vendor-datepicker'
          if (id.includes('zustand')) return 'vendor-state'
          if (id.includes('react-router-dom')) return 'vendor-router'
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react'
        },
      },
    },
  },
})
