import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CATEGORIES } from '../data/categories'
import {
  STORAGE_KEYS,
  SEARCH_MAX_PRODUCTS,
  SEARCH_MAX_CATEGORIES,
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_MAX_RECENT,
} from '../utils/constants'
import type { Product, Category } from '../types'
import { listProducts, adaptProduct } from '../api/product'

export interface SearchResult {
  products: Product[]
  categories: Category[]
}

let searchTimer: ReturnType<typeof setTimeout> | null = null

interface SearchState {
  isOpen: boolean
  query: string
  results: SearchResult
  recentSearches: string[]

  open: () => void
  close: () => void
  setQuery: (q: string) => void
  commit: (q: string) => void
  removeRecent: (q: string) => void
  clearRecent: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      query: '',
      results: { products: [], categories: [] },
      recentSearches: [],

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false, query: '', results: { products: [], categories: [] } }),

      setQuery: (q) => {
        set({ query: q })
        const trimmed = q.trim()
        if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) {
          set({ results: { products: [], categories: [] } })
          return
        }

        const categories = CATEGORIES.filter(
          (c) => c.fa.includes(trimmed) || c.en.toLowerCase().includes(trimmed.toLowerCase()),
        ).slice(0, SEARCH_MAX_CATEGORIES)

        set({ results: { products: get().results.products, categories } })

        if (searchTimer) clearTimeout(searchTimer)
        searchTimer = setTimeout(async () => {
          try {
            const { items } = await listProducts({ q: trimmed, limit: SEARCH_MAX_PRODUCTS })
            set((state) => ({
              results: {
                ...state.results,
                products: items.slice(0, SEARCH_MAX_PRODUCTS).map((p) => adaptProduct(p)),
              },
            }))
          } catch {
            // keep current results on error
          }
        }, 300)
      },

      commit: (q) => {
        const trimmed = q.trim()
        if (!trimmed) return
        const prev = get().recentSearches.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())
        set({ recentSearches: [trimmed, ...prev].slice(0, SEARCH_MAX_RECENT) })
      },

      removeRecent: (q) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((r) => r !== q),
        })),

      clearRecent: () => set({ recentSearches: [] }),
    }),
    {
      name: STORAGE_KEYS.search,
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    },
  ),
)
