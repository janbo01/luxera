import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  integrations: [react()],
  adapter: node({ mode: 'standalone' }),
  output: 'server',
  build: {
    // 'always' inlines the Tailwind bundle (~17 KB brotli / 124 KB raw) into every HTML
    // response, removing the render-blocking CSS request from the critical path — worth
    // one round trip of FCP/LCP on cold visits, which dominate storefront traffic.
    // Trade-off: SPA navigations via ClientRouter re-download the CSS inside each page's
    // HTML instead of hitting the browser cache. Early Hints aren't an option (origin
    // nginx 1.24, TLS terminates at ArvanCloud), so this is the only critical-path fix.
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Give fonts stable (non-hashed) paths so <link rel="preload"> tags can reference them.
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names?.[0] ?? ''
            if (/\.(woff2|woff|ttf|eot)$/i.test(name)) {
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
  security: {
    // Delivered as a real Content-Security-Policy response header (Astro's default for
    // on-demand/server routes — stronger than a <meta> tag). script-src/style-src get
    // 'self' + auto-generated hashes for every script/style Astro compiles at build time.
    // Two things aren't build-time-known and register their own hash at render time via
    // Astro.csp.insertScriptHash/insertStyleHash (see cspHash() in src/lib/ssr.ts):
    // the theme <style> tag (per-request, from store settings) and HydrateReader.astro's
    // script (marked is:inline for reasons documented there, which opts it out of
    // Astro's own hash tracking). Hydration *data* itself (product/category/etc.) is
    // never an executable script — see jsonIsland() in ssr.ts — so it needs no hash and
    // survives Astro ClientRouter's client-side page swaps.
    // style-src's hashes are stripped back out in src/middleware.ts (see there for why).
    csp: {
      directives: [
        "default-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "img-src 'self' https://image.luxera.ir https://img.luxera.ir https://trustseal.enamad.ir",
        "connect-src 'self' https://api.luxera.ir",
        "font-src 'self'",
      ],
    },
  },
})
