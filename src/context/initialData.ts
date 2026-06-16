import type { ApiBlogPost, ApiBlogPostList } from '../api/blog'

export interface ServerInitialData {
  product?: unknown
  productComments?: unknown
  collection?: unknown
  collections?: unknown
  categoryProducts?: unknown
  categoryResolvedId?: string | null
  blogPost?: ApiBlogPost
  blogList?: ApiBlogPostList
}
