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
              // Capture react-router-dom + its peer packages (react-router, @remix-run/router)
              if (
                id.includes('react-router-dom') ||
                id.includes('node_modules/react-router/') ||
                id.includes('node_modules/@remix-run/')
              )
                return 'vendor-router'
              // Split react core (tiny, stable) from react-dom (large) for better caching
              if (id.includes('node_modules/react-dom/')) return 'vendor-react-dom'
              if (id.includes('node_modules/react/')) return 'vendor-react'
            },
          },
        },
  },
}))
