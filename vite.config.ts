import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    tailwindcss(),
    react(),
    ...(isSsrBuild
      ? []
      : [
          viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
          viteCompression({ algorithm: 'gzip', ext: '.gz' }),
        ]),
  ],
  build: {
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            manualChunks(id) {
              if (id.includes('zustand')) return 'vendor-state'
              if (id.includes('react-router-dom')) return 'vendor-router'
              if (
                id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/')
              )
                return 'vendor-react'
            },
          },
        },
  },
}))
