import { apiFetch } from './client'
import { cachedFetch, invalidateCacheByPrefix } from './cache'
import type { Product } from '../types'

const TTL = {
  categories: 15 * 60 * 1000,
  colors: 15 * 60 * 1000,
  collections: 10 * 60 * 1000,
  product: 5 * 60 * 1000,
  products: 3 * 60 * 1000,
}

const BASE = import.meta.env.VITE_PRODUCT_API as string

export interface ApiProduct {
  id: string
  title: string
  title_fa?: string
  title_en?: string
  short_description: string
  long_description: string
  price: string
  old_price?: string
  is_new: boolean
  is_sale: boolean
  brand_id: string
  category_id: string
  subcategory_id?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ApiProductImage {
  id: string
  product_id: string
  url: string
  position: number
  created_at: string
}

export interface ApiProductColor {
  id: string
  product_id: string
  name: string
  hex_code?: string
  created_at: string
}

export interface ApiProductSize {
  id: string
  product_id: string
  value: string
  sort_order: number
  created_at: string
}

export interface ApiProductVariant {
  id: string
  product_id: string
  color_id: string | null
  size_id: string | null
  quantity: number
  created_at: string
  updated_at: string
}

export interface ApiProductDetail extends ApiProduct {
  images: ApiProductImage[]
  colors: ApiProductColor[]
  sizes: ApiProductSize[]
  variants: ApiProductVariant[]
  highlights: string[]
  specs: string[][]
  rating: number
  review_count: number
}

export interface ApiProductsResponse {
  items: ApiProduct[]
  next_cursor: string
  limit: number
}

export interface ApiBatchItem {
  id: string
  title: string
  price: string
  image_url: string
}

export interface ApiCategory {
  id: string
  name: string
  image_url?: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface ApiCollection {
  id: string
  slug: string
  name_fa: string
  name_en?: string
  description?: string
  cover_image_url?: string
  tone: string
  badge?: string
  product_count: number
  created_at: string
}

export interface ApiCollectionsResponse {
  items: ApiCollection[]
}

export interface ApiCollectionDetail {
  id: string
  slug: string
  name_fa: string
  name_en?: string
  description?: string
  cover_image_url?: string
  tone: string
  badge?: string
  products: ApiProduct[]
  created_at: string
}

export interface ApiCommentResponse {
  id: string
  product_id: string
  user_id: string
  content: string
  rating?: number
  created_at: string
  updated_at: string
}

export interface ApiCommentsResponse {
  items: ApiCommentResponse[]
  total: number
  limit: number
  offset: number
}

export interface ApiColor {
  id: string
  name: string
  hex_code?: string
  created_at: string
}

export interface ListProductsParams {
  q?: string
  categoryId?: string
  brandId?: string
  subcategoryId?: string
  colorIds?: string[]
  sort?: string
  limit?: number
  afterId?: string
}

export function adaptProduct(api: ApiProduct, categoryName?: string): Product {
  const price = parseFloat(api.price)
  const oldPrice = api.old_price ? parseFloat(api.old_price) : null
  const badge = api.is_new ? 'تازه' : api.is_sale ? 'تخفیف' : null
  const badgeKind: 'new' | 'sale' | undefined = api.is_new
    ? 'new'
    : api.is_sale
    ? 'sale'
    : undefined

  const detail = api as ApiProductDetail
  const imageUrl = detail.images?.[0]?.url ?? api.image_url
  const imageUrlAlt = detail.images?.[1]?.url

  return {
    id: api.id,
    fa: api.title_fa ?? api.title,
    en: api.title_en ?? api.title,
    cat: categoryName ?? '',
    catId: api.category_id,
    price,
    oldPrice,
    badge,
    badgeKind,
    illus: 'NecklaceB',
    illusAlt: 'NecklaceC',
    meta: [],
    imageUrl,
    imageUrlAlt,
  }
}

function buildProductsQS(params: ListProductsParams): string {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.categoryId) qs.set('category_id', params.categoryId)
  if (params.brandId) qs.set('brand_id', params.brandId)
  if (params.subcategoryId) qs.set('subcategory_id', params.subcategoryId)
  if (params.colorIds?.length) params.colorIds.forEach((id) => qs.append('color_id', id))
  if (params.sort) qs.set('sort', params.sort)
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.afterId) qs.set('after_id', params.afterId)
  return qs.toString()
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<{ items: ApiProduct[]; nextCursor: string }> {
  const qs = buildProductsQS(params)
  const url = `${BASE}/products${qs ? '?' + qs : ''}`
  return cachedFetch(
    `products:${qs}`,
    async () => {
      const res = await apiFetch<ApiProductsResponse>(url)
      return { items: res.items ?? [], nextCursor: res.next_cursor ?? '' }
    },
    TTL.products,
  )
}

export async function getProduct(id: string): Promise<ApiProductDetail> {
  return cachedFetch(
    `product:${id}`,
    () => apiFetch<ApiProductDetail>(`${BASE}/products/${id}`),
    TTL.product,
  )
}

export async function batchProducts(ids: string[]): Promise<ApiBatchItem[]> {
  if (!ids.length) return []
  const url = `${BASE}/products/batch?ids=${ids.join(',')}`
  const res = await apiFetch<{ items: ApiBatchItem[] }>(url)
  return res.items ?? []
}

export async function listColors(): Promise<ApiColor[]> {
  return cachedFetch(
    'colors',
    async () => {
      const res = await apiFetch<ApiColor[]>(`${BASE}/colors`)
      return Array.isArray(res) ? res : []
    },
    TTL.colors,
  )
}

export async function listCategories(): Promise<ApiCategory[]> {
  return cachedFetch(
    'categories',
    async () => {
      const res = await apiFetch<ApiCategory[]>(`${BASE}/categories`)
      return Array.isArray(res) ? res : []
    },
    TTL.categories,
  )
}

export async function listCollections(): Promise<ApiCollection[]> {
  return cachedFetch(
    'collections',
    async () => {
      const res = await apiFetch<ApiCollectionsResponse>(`${BASE}/collections`)
      return res.items ?? []
    },
    TTL.collections,
  )
}

export async function getCollectionBySlug(
  slug: string,
): Promise<ApiCollectionDetail> {
  return cachedFetch(
    `collection:${slug}`,
    () => apiFetch<ApiCollectionDetail>(`${BASE}/collections/${slug}`),
    TTL.product,
  )
}

export { invalidateCacheByPrefix }

export async function listComments(
  productId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<ApiCommentsResponse> {
  const qs = new URLSearchParams()
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.offset) qs.set('offset', String(params.offset))
  const query = qs.toString()
  return apiFetch<ApiCommentsResponse>(
    `${BASE}/products/${productId}/comments${query ? '?' + query : ''}`,
  )
}

export async function createComment(
  productId: string,
  content: string,
  rating?: number,
): Promise<ApiCommentResponse> {
  return apiFetch<ApiCommentResponse>(`${BASE}/products/${productId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, ...(rating !== undefined ? { rating } : {}) }),
  })
}

export async function subscribeStockNotification(
  productId: string,
  phone: string,
): Promise<void> {
  await apiFetch(`${BASE}/products/${productId}/notify`, {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}
