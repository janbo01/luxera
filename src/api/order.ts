import { apiFetch } from './client'
import type { Order, OrderStatus } from '../types'

const BASE = import.meta.env.VITE_ORDER_API as string

export interface ApiCartProduct {
  title: string
  price: string
  image_url: string
}

export interface ApiCartItem {
  product_id: string
  quantity: number
  product: ApiCartProduct
}

export interface ApiCart {
  items: ApiCartItem[]
  subtotal: string
}

export interface ApiOrderItem {
  id: string
  product_id: string
  title: string
  price_at_purchase: string
  quantity: number
  subtotal: string
}

export type ApiOrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface ApiOrder {
  id: string
  status: ApiOrderStatus
  tracking_code?: string
  subtotal: string
  discount_amount?: string
  total_amount: string
  coupon_id?: string
  shipping_address_id: string
  shipping_method: string
  delivery_date?: string
  delivery_slot?: string
  notes?: string
  loyalty_points_used?: number
  loyalty_discount_amount?: string
  loyalty_points_earned?: number
  items: ApiOrderItem[]
  created_at: string
}

export interface ApiOrdersResponse {
  orders: ApiOrder[]
  total: number
}

export interface ApiCheckoutItem {
  product_id: string
  quantity: number
}

export interface ApiCheckoutInput {
  coupon_code?: string
  shipping_address_id: string
  shipping_method: string
  delivery_date?: string
  delivery_slot?: string
  notes?: string
  items?: ApiCheckoutItem[]
  loyalty_points_to_use?: number
}

export interface ApiCoupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  min_order_amount: string
  expires_at: string | null
}

export interface ApiApplyCouponResponse {
  coupon_id: string
  code: string
  discount_type: string
  discount_value: string
  discount_amount: string
  final_total: string
}

export interface ApiDeliverySlotItem {
  label: string
}

export interface ApiDeliverySlot {
  date: string
  slots: ApiDeliverySlotItem[]
}

export async function getCart(): Promise<ApiCart> {
  return apiFetch<ApiCart>(`${BASE}/cart`)
}

export async function setCartItem(productId: string, quantity: number): Promise<void> {
  await apiFetch(`${BASE}/cart/items`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  })
}

export async function removeCartItem(productId: string): Promise<void> {
  await apiFetch(`${BASE}/cart/items/${productId}`, { method: 'DELETE' })
}

export async function clearCart(): Promise<void> {
  await apiFetch(`${BASE}/cart`, { method: 'DELETE' })
}

export async function listOrders(): Promise<ApiOrdersResponse> {
  return apiFetch<ApiOrdersResponse>(`${BASE}/orders`)
}

export async function getOrder(id: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`${BASE}/orders/${id}`)
}

export async function checkout(data: ApiCheckoutInput): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`${BASE}/orders/checkout`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function cancelOrder(id: string): Promise<void> {
  await apiFetch(`${BASE}/orders/${id}/cancel`, { method: 'PATCH' })
}

export async function getCoupon(code: string): Promise<ApiCoupon> {
  return apiFetch<ApiCoupon>(`${BASE}/coupons/${code}`)
}

export async function applyCoupon(code: string, subtotal: string): Promise<ApiApplyCouponResponse> {
  return apiFetch<ApiApplyCouponResponse>(`${BASE}/coupons/apply`, {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  })
}

export async function getDeliverySlots(): Promise<ApiDeliverySlot[]> {
  const res = await apiFetch<{ options: ApiDeliverySlot[] }>(`${BASE}/delivery/slots`)
  return res?.options ?? []
}

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'pending',
  paid: 'processing',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

export function adaptOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    date: new Date(o.created_at).toLocaleDateString('fa-IR'),
    status: ORDER_STATUS_MAP[o.status] ?? 'pending',
    items: o.items.map((it) => ({
      productId: it.product_id,
      name: it.title,
      qty: it.quantity,
      price: parseFloat(it.price_at_purchase),
      illus: '',
    })),
    total: parseFloat(o.total_amount),
    address: o.shipping_address_id,
    trackingCode: o.tracking_code ?? null,
  }
}
