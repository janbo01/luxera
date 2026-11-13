/**
 * Reads a server JSON island (`<script type="application/json" data-hydrate="NAME">`).
 *
 * HydrateReader copies islands onto `window` on `astro:page-load`, which fires after
 * `client:load` islands have mounted, so a component that checks `window.NAME` in its
 * mount effect finds nothing and refetches over the network. This reads the DOM block
 * directly when the global isn't there yet, and caches it on `window`.
 */
export function readIsland<T>(name: string): T | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as Record<string, unknown>
  if (w[name] !== undefined) return (w[name] ?? undefined) as T | undefined
  const el = document.querySelector(`script[type="application/json"][data-hydrate="${name}"]`)
  if (!el) return undefined
  try {
    const value = JSON.parse(el.textContent || 'null') as T | null
    w[name] = value
    return value ?? undefined
  } catch {
    return undefined
  }
}
