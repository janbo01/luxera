import { createContext, useContext } from 'react'
import type { ApiProduct, ApiCategory, ApiCollection } from '../../api/product'
import type { ApiBlogPost } from '../../api/blog'

/** Home-page lists fetched during SSR (fetchHomeListsData in lib/ssr.ts). */
export interface HomeInitialData {
  categories?: Pick<ApiCategory, 'id' | 'name' | 'image_url'>[]
  carousels?: Record<string, Partial<ApiProduct>[]>
  blog?: { posts: Partial<ApiBlogPost>[]; total: number; page: number; page_size: number }
  /** The collection the home spotlight features. */
  spotlight?: Pick<
    ApiCollection,
    'id' | 'slug' | 'name_fa' | 'description' | 'cover_image_url' | 'product_count'
  >
}

/**
 * Handed to the home islands as props (HomePage provides it to its sections through this
 * context), so the server renders the real rails, tiles and spotlight. They used to read
 * a JSON island after hydration, which meant SSR drew skeletons and the swap to real
 * cards — whose height depends on title length and price — moved everything below.
 */
export const HomeListsContext = createContext<HomeInitialData | null | undefined>(undefined)

export const useHomeLists = () => useContext(HomeListsContext)
