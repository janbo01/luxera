import { useSyncExternalStore } from 'react'

// Never-changing external store: there's nothing to subscribe to, the value is
// determined entirely by whether we're rendering on the server or the client.
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Returns `false` during SSR and the first client render, then `true` after hydration.
 *
 * Use this to gate UI that depends on persisted, client-only state (e.g. the cart and
 * wishlist counts rehydrated from localStorage). Rendering that state during the first
 * client paint causes a server/client hydration mismatch (React error #418), because the
 * server has no localStorage. `useSyncExternalStore` keeps the first client render in sync
 * with the server snapshot, then re-renders with the real value once hydration completes.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)
}
