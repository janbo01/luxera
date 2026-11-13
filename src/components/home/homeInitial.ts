import { readIsland } from '../../utils/island'
import type { ApiProduct, ApiCategory } from '../../api/product'
import type { ApiBlogPost } from '../../api/blog'

export interface HomeInitialData {
  categories?: Pick<ApiCategory, 'id' | 'name' | 'image_url'>[]
  carousels?: Record<string, Partial<ApiProduct>[]>
  blog?: { posts: Partial<ApiBlogPost>[]; total: number; page: number; page_size: number }
}

declare global {
  interface Window {
    __HOME_INITIAL__?: HomeInitialData | null
  }
}

export function readHomeInitial(): HomeInitialData | undefined {
  return readIsland<HomeInitialData>('__HOME_INITIAL__')
}
