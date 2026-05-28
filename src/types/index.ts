export interface Product {
  id: string
  fa: string
  en: string
  cat: string
  catId: string
  price: number
  oldPrice: number | null
  badge: string | null
  badgeKind?: 'new' | 'sale'
  illus: string
  illusAlt: string
  meta: string[]
  imageUrl?: string
  imageUrlAlt?: string
}

export interface ProductDetail extends Product {
  rating: number
  reviewCount: number
  description: string
  highlights: string[]
  specs: [string, string][]
  stockCount: number
}

export interface Category {
  id: string
  fa: string
  en: string
  num: string
  illus: string
  bg: 'plum' | 'neutral' | 'light' | 'dark' | 'copper'
}

export interface CartItem extends Product {
  qty: number
}

export interface GalleryItem {
  tone: HeroTone
  illus: string
}

export interface ColorOption {
  id: string
  fa: string
  swatch: 'gold' | 'rose' | 'white'
  hex?: string
  disabled?: boolean
}

export interface SizeOption {
  id: string
  label: string
  disabled: boolean
}

export interface Review {
  name: string
  date: string
  avatar: string
  rating: number
  verified: boolean
  title: string
  body: string
  attrs: Record<string, string>
  helpful: number
  replies: number
}

export interface ReviewBreakdown {
  stars: number
  count: number
  pct: number
}

export interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  province: string
  city: string
  street: string
  postalCode: string
  isDefault: boolean
}

export interface OrderItem {
  productId: string
  name: string
  qty: number
  price: number
  illus: string
}

export type ShippingMethod = 'snapp_box' | 'tipax' | 'post'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  address: string
  trackingCode: string | null
}

export interface UserProfile {
  name: string
  phone: string
  email: string
  createdAt?: string
  updatedAt?: string
  birthDate?: string
  gender?: string
  nationalId?: string
  avatarUrl?: string
}

export type Palette = 'white' | 'jewel' | 'ivory' | 'noir' | 'rose'
export type Density = 'editorial' | 'balanced' | 'shoppy'
export type HeroVariant = 'default' | 'split' | 'full'
export type HeroTone = 'plum' | 'sand' | 'copper'

export type CheckoutStep = 0 | 1 | 2
export type CouponState = 'idle' | 'loading' | 'applied' | 'error'
export type PaymentGateway = 'mock' | 'zarinpal' | 'saman'

export interface AddressForm {
  label: string
  name: string
  phone: string
  province: string
  city: string
  street: string
  postal: string
}
