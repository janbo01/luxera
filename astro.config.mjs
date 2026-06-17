import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  integrations: [react()],
  adapter: node({ mode: 'standalone' }),
  output: 'server',
  build: {
    // Inline all CSS into <style> tags — eliminates the render-blocking external CSS request.
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Give fonts stable (non-hashed) paths so <link rel="preload"> tags can reference them.
          assetFileNames: ({ name }) => {
            if (name && /\.(woff2|woff|ttf|eot)$/i.test(name)) {
              return 'fonts/[name][extname]'
            }
            return '_astro/[name].[hash][extname]'
          },
        },
      },
    },
  },
  server: {
    port: 3000,
  },
})
