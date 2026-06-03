import { apiFetch } from './client'

const BASE = import.meta.env.VITE_STORE_API as string

export interface ApiStoreSettings {
  store_name: string
  tagline: string
  logo_url: string
  favicon_url: string
  instagram_url: string
  whatsapp_number: string
  bale_link: string
  ita_link: string
  support_phone: string
  support_landline: string
  theme_bg: string
  theme_brand: string
  theme_accent: string
  theme_light: string
  theme_text: string
  loyalty_point_value: number
  loyalty_earn_percent: string
  updated_at: string
}

export interface ApiBannerProduct {
  id: string
  title: string
  title_fa: string
  price: string
  old_price: string
  image_url: string
}

export interface ApiBanner {
  id: string
  image_url: string
  title: string
  subtitle: string
  link_url: string
  product_id: string | null
  product: ApiBannerProduct | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getStoreSettings(): Promise<ApiStoreSettings> {
  return apiFetch<ApiStoreSettings>(`${BASE}/store/settings`)
}

export async function listBanners(): Promise<ApiBanner[]> {
  const res = await apiFetch<ApiBanner[]>(`${BASE}/store/banners`)
  return Array.isArray(res) ? res : []
}
