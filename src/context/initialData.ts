import { createContext, useContext } from 'react'
import type { ApiBanner } from '../api/store'
import type { ApiBlogPost, ApiBlogPostList } from '../api/blog'

export interface ServerInitialData {
  product?: unknown
  collection?: unknown
  collections?: unknown
  categoryProducts?: unknown
  categoryResolvedId?: string | null
  banners?: ApiBanner[]
  footerCategories?: Array<{ id: string; name: string }>
  footerCollections?: Array<{ id: string; slug: string; name_fa: string }>
  blogPost?: ApiBlogPost
  blogList?: ApiBlogPostList
}

const InitialDataContext = createContext<ServerInitialData>({})

export { InitialDataContext }

export function useInitialData(): ServerInitialData {
  return useContext(InitialDataContext)
}
