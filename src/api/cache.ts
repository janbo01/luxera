interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

export function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const hit = store.get(key) as CacheEntry<T> | undefined
  if (hit && Date.now() < hit.expiresAt) return Promise.resolve(hit.value)

  const pending = inflight.get(key) as Promise<T> | undefined
  if (pending) return pending

  const promise = fetcher()
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs })
      inflight.delete(key)
      return value
    })
    .catch((err: unknown) => {
      inflight.delete(key)
      throw err
    })

  inflight.set(key, promise as Promise<unknown>)
  return promise
}

export function invalidateCacheByPrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}
