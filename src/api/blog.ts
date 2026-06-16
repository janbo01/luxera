import { apiFetch } from './client'

const BASE = import.meta.env.PUBLIC_STORE_API as string

export interface ApiBlogPost {
  id: string
  title: string
  slug: string
  body: string
  excerpt: string
  featured_image_url: string | null
  seo_title: string
  seo_description: string
  seo_keywords: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ApiBlogPostList {
  posts: ApiBlogPost[]
  total: number
  page: number
  page_size: number
}

export function getBlogPosts(page = 1, pageSize = 12): Promise<ApiBlogPostList> {
  return apiFetch<ApiBlogPostList>(`${BASE}/store/blog?page=${page}&page_size=${pageSize}`)
}

export function getBlogPostBySlug(slug: string): Promise<ApiBlogPost> {
  return apiFetch<ApiBlogPost>(`${BASE}/store/blog/${encodeURIComponent(slug)}`)
}
