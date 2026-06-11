import { apiFetch } from './client'

const BASE = import.meta.env.VITE_USER_API as string

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('98')) return `+${digits}`
  if (digits.startsWith('09')) return `+98${digits.slice(1)}`
  if (digits.startsWith('9') && digits.length === 10) return `+98${digits}`
  return `+${digits}`
}

export function fromE164(phone: string): string {
  if (phone.startsWith('+98')) return `0${phone.slice(3)}`
  return phone
}

export interface ApiProfile {
  id: string
  phone: string
  full_name: string
  email: string
  created_at: string
  updated_at: string
  birth_date?: string
  gender?: string
  national_id?: string
  avatar_url?: string
}

export interface ApiAddress {
  id: string
  user_id: string
  title: string
  full_address: string
  city: string
  province: string
  postal_code: string
  is_default: boolean
  recipient_name: string
  recipient_phone: string
  created_at: string
  updated_at: string
}

export interface ApiAddressInput {
  title: string
  full_address: string
  city: string
  province: string
  postal_code: string
  is_default: boolean
  recipient_name: string
  recipient_phone: string
}

export interface ApiWishlistItem {
  product_id: string
  added_at: string
}

export async function requestOTP(phone: string): Promise<void> {
  await apiFetch(`${BASE}/auth/otp/request`, {
    method: 'POST',
    body: JSON.stringify({ phone: toE164(phone) }),
  })
}

export async function verifyOTP(
  phone: string,
  otp: string,
): Promise<{ token: string; isNew: boolean }> {
  const res = await apiFetch<{ token: string; is_new: boolean }>(`${BASE}/auth/otp/verify`, {
    method: 'POST',
    body: JSON.stringify({ phone: toE164(phone), otp }),
  })
  return { token: res.token, isNew: res.is_new }
}

export async function signout(token: string): Promise<void> {
  await apiFetch(`${BASE}/auth/signout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getProfile(): Promise<ApiProfile> {
  return apiFetch<ApiProfile>(`${BASE}/profile`)
}

export async function updateProfile(data: {
  fullName?: string
  email?: string
  birthDate?: string
  gender?: string
  nationalId?: string
}): Promise<ApiProfile> {
  return apiFetch<ApiProfile>(`${BASE}/profile`, {
    method: 'PUT',
    body: JSON.stringify({
      full_name: data.fullName,
      email: data.email,
      birth_date: data.birthDate,
      gender: data.gender,
      national_id: data.nationalId,
    }),
  })
}

export async function listAddresses(): Promise<ApiAddress[]> {
  const res = await apiFetch<ApiAddress[]>(`${BASE}/addresses`)
  return Array.isArray(res) ? res : []
}

export async function createAddress(data: ApiAddressInput): Promise<ApiAddress> {
  return apiFetch<ApiAddress>(`${BASE}/addresses`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAddress(id: string, data: ApiAddressInput): Promise<ApiAddress> {
  return apiFetch<ApiAddress>(`${BASE}/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteAddress(id: string): Promise<void> {
  await apiFetch(`${BASE}/addresses/${id}`, { method: 'DELETE' })
}

export async function setDefaultAddress(id: string): Promise<void> {
  await apiFetch(`${BASE}/addresses/${id}/default`, { method: 'PATCH' })
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const form = new FormData()
  form.append('avatar', file)
  return apiFetch<{ avatar_url: string }>(`${BASE}/profile/avatar`, {
    method: 'POST',
    body: form,
  })
}

export async function deleteAvatar(): Promise<void> {
  await apiFetch(`${BASE}/profile/avatar`, { method: 'DELETE' })
}

export async function getWishlist(): Promise<ApiWishlistItem[]> {
  const res = await apiFetch<ApiWishlistItem[]>(`${BASE}/wishlist`)
  return Array.isArray(res) ? res : []
}

export async function addWishlistItem(productId: string): Promise<void> {
  await apiFetch(`${BASE}/wishlist/items`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  })
}

export async function removeWishlistItem(productId: string): Promise<void> {
  await apiFetch(`${BASE}/wishlist/items/${productId}`, { method: 'DELETE' })
}

export async function getLoyaltyBalance(): Promise<number> {
  const res = await apiFetch<{ balance: number }>(`${BASE}/profile/loyalty`)
  return res.balance ?? 0
}
