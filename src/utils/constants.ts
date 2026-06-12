export const STORAGE_KEYS = {
  cart: 'luxera-cart',
  wishlist: 'luxera-wishlist',
  auth: 'luxera-auth',
  ui: 'luxera-ui',
  search: 'luxera-search',
} as const

export const UI_DEFAULTS = {
  palette: 'white',
  density: 'balanced',
  heroVariant: 'default',
} as const

export const FREE_SHIPPING_THRESHOLD = 2_500_000
export const SEARCH_MAX_PRODUCTS = 5
export const SEARCH_MAX_CATEGORIES = 3
export const SEARCH_MIN_QUERY_LENGTH = 2
export const SEARCH_MAX_RECENT = 8
