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
    // Renders a per-request <meta http-equiv="content-security-policy"> tag.
    // script-src/style-src get 'self' + auto-generated hashes for every script/style
    // Astro compiles at build time; per-request dynamic scripts (hydration data, JSON-LD,
    // the theme <style>) register their own hash at render time via Astro.csp.insertScriptHash
    // / insertStyleHash in src/lib/ssr.ts + the pages that call it — see cspHash() there.
    // frame-ancestors/report-uri/sandbox are omitted: browsers ignore them in a <meta> CSP.
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
